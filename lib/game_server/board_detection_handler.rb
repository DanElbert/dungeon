require File.expand_path('../../../lib/board_detector', __FILE__)

module GameServer
  class BoardDetectionHandler < Handler

    CHANNEL_REGEX = /^\/game\/(\d+)\/board_detection/

    def should_handle_message(channel)
      !channel.nil? && !!(CHANNEL_REGEX =~ channel)
    end

    def handle(message)
      # Assume that should_handle_message has already been called and this will always work
      game_id = CHANNEL_REGEX.match(message['channel'])[1].to_i

      game = Game.includes(:board).find(game_id)
      action_data = message['data']

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      process_action(message['data'], game)
    end

    def process_action(data, game)

      current_session = BoardDetectionSession.current.where(game_id: game.id).first

      case data['actionType']
        when 'initializeBoardDetectionAction'
          if current_session
            current_session.fail!
          end
          current_session = BoardDetectionSession.new(game: game, state: BoardDetectionSession::VALID_STATES[:initialized])
          current_session.save!

        when 'submitBoardDetectionGeometryAction'
          unless current_session
            message['error'] = 'No current capture session'
            return
          end

          current_session.state = BoardDetectionSession::VALID_STATES[:capturing]
          current_session.detect_origin_x = data['origin_x']
          current_session.detect_origin_y = data['origin_y']
          current_session.detect_width = data['width']
          current_session.detect_height = data['height']
          current_session.pattern_size = data['pattern_size']
          current_session.pattern_dimension = data['pattern_dimension']
          current_session.save!

        when 'captureBoardDetectionImageAction'
          unless current_session
            message['error'] = 'No current capture session'
            return
          end

          current_session['image'] = data['image_data']['data:image/png;base64,'.length .. -1]
          current_session['image_orientation'] = data['image_orientation']
          current_session.save!

          # call out to image processor to perform work, then send a new message with the tokens
          detector_interface = BoardDetector::Interface.new
          result = detector_interface.get_found_objects(current_session)

          send_channel = "/game/#{game.id}/board_detection"
          token_channel = "/game/#{game.id}/add_action"

          if !result.was_board_found
            action = BoardAction.build_action_hash('alertAction', nil, {type: 'error', message: 'Unable to find board!'})
            client.publish(send_channel, action)
          elsif result.was_board_found && result.items.empty?
            action = BoardAction.build_action_hash('alertAction', nil, {type: 'warning', message: 'No items found on board'})
            client.publish(send_channel, action)
          else
            action = BoardAction.build_action_hash('alertAction', nil, {type: 'notice', message: "#{result.items.length} items have been marked"})
            client.publish(send_channel, action)

            token_data = { tokens: result.items.map{ |i| i.as_json } }
            action = BoardAction.build_action_hash('setTokensAction', nil, token_data)
            client.publish(token_channel, action)
          end


        when 'finishBoardDetectionAction'
          if current_session
            current_session.finish!
          end

      end

    end
  end
end