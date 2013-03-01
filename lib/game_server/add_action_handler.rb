module GameServer
  class AddActionHandler
    DRAWING_ACTION_TYPES = %w(penAction removeDrawingAction)

    def process_message(message)
      game_id = nil

      if message['ext'] && message['ext']['game_id']
        game_id = message['ext']['game_id']
      end

      unless game_id
        message['error'] = "Missing Game Id"
        return
      end

      game = Game.includes(:game_board).find(game_id)

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      if DRAWING_ACTION_TYPES.include? message['data']['actionType']
        action = BoardDrawingAction.from_message(message['data'])
        action.board = game.game_board
        action.save!
      end

    end
  end
end