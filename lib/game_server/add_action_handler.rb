module GameServer
  class AddActionHandler < Handler

    DRAWING_ACTION_TYPES = %w(penAction removeDrawingAction eraseAction squarePenAction circlePenAction)
    TEMPLATE_ACTION_TYPES = %w(removeTemplateAction movementTemplateAction radiusTemplateAction lineTemplateAction coneTemplateAction)
    COMPOSITE_ACTION_TYPE = 'compositeAction'
    CHANNEL_REGEX = /^\/game\/(\d+)\/add_action$/

    def should_handle_message(channel)
      !channel.nil? && !!(CHANNEL_REGEX =~ channel)
    end

    def handle(message)
      # Assume that should_handle_message has already been called and this will always work
      game_id = CHANNEL_REGEX.match(message['channel'])[1].to_i

      game = Game.includes(:game_board).find(game_id)

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      process_action(message['data'], game)
    end

    def process_action(action_data, game)

      puts "processing #{action_data['actionType']}"

      if DRAWING_ACTION_TYPES.include? action_data['actionType']
        action = BoardDrawingAction.from_message(action_data)
        action.board = game.game_board
        action.save!
      end

      if TEMPLATE_ACTION_TYPES.include? action_data['actionType']
        action = BoardTemplateAction.from_message(action_data)
        action.board = game.game_board
        action.save!
      end

      if COMPOSITE_ACTION_TYPE == action_data['actionType']
        action_data['actionList'].each do |sub_action|
          process_action(sub_action, game)
        end
      end

    end
  end
end