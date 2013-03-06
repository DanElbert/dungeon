module GameServer
  class AddActionHandler < Handler

    DRAWING_ACTION_TYPES = %w(penAction removeDrawingAction eraseAction)
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

      if DRAWING_ACTION_TYPES.include? message['data']['actionType']
        action = BoardDrawingAction.from_message(message['data'])
        action.board = game.game_board
        action.save!
      end

    end
  end
end