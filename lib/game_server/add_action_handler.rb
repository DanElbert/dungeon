module GameServer
  class AddActionHandler < Handler

    COMPOSITE_ACTION_TYPE = 'compositeAction'
    INITIATIVE_ACTION = 'updateInitiativeAction'
    CHANNEL_REGEX = /^\/game\/(\d+)\/add_action$/

    def should_handle_message(channel)
      !channel.nil? && !!(CHANNEL_REGEX =~ channel)
    end

    def handle(message)
      # Assume that should_handle_message has already been called and this will always work
      game_id = CHANNEL_REGEX.match(message['channel'])[1].to_i

      game = Game.includes(:board, :initiatives).find(game_id)

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      process_action(message['data'], game)
    end

    def process_action(action_data, game)

      if COMPOSITE_ACTION_TYPE == action_data['actionType']
        action_data['actionList'].each do |sub_action|
          process_action(sub_action, game)
        end
      end

      if INITIATIVE_ACTION == action_data['actionType']
        game.initiatives.destroy_all

        action_data['initiative'].each_with_index do |init, i|
          game.initiatives << Initiative.from_message(init, i)
        end
      end

      if action_data['isRemoval']
        BoardAction.where(:board_id => game.board.id, :uid => action_data['actionId']).destroy_all
      end

      if action_data['isPersistent']
        action = BoardAction.from_message(action_data)
        action.board = game.board
        action.save!
      end
    end
  end
end