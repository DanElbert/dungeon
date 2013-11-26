module GameServer
  class UpdateInitiativeHandler < Handler

    CHANNEL_REGEX = /^\/game\/(\d+)\/update_initiative/

    def should_handle_message(channel)
      !channel.nil? && !!(CHANNEL_REGEX =~ channel)
    end

    def handle(message)
      # Assume that should_handle_message has already been called and this will always work
      game_id = CHANNEL_REGEX.match(message['channel'])[1].to_i

      game = Game.includes(:board, :initiatives).find(game_id)
      action_data = message['data']

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      game.transaction do
        game.initiatives.destroy_all

        action_data['initiative'].each_with_index do |init, i|
          game.initiatives << Initiative.from_message(init, i)
        end

        game.update_initiative_counts(game.initiatives.map { |i| i.name })
      end
    end
  end
end