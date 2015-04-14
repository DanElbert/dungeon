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

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      process_action(message, game)
    end

    def process_action(message, game)

      data = message['data']

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

          # clear image data from message
          data['image_data'] = ''

          # call out to image processor to perform work, then send a new message with the tokens
          detector_interface = BoardDetector::Interface.new(current_session)

          detector_interface.callback do |result|
            send_channel = "/game/#{game.id}/board_detection"

            action = BoardAction.build_action_hash('boardDetectionResultsAction', nil, {results: result.as_json})
            client.publish(send_channel, action)
          end

          detector_interface.async

        when 'finishBoardDetectionAction'
          if current_session
            current_session.finish!
          end

      end

    end
  end
end