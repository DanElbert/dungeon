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
        names = []
        new_names = []
        sort_idx = 0
        init_attrs = action_data['initiative'].map do |i|
          id = i['id'].to_i
          id = nil if id <= 0
          names << i['name'] unless i['_destroy'] || id.nil?
          new_names << i['name'] if id.nil?
          {
              id: id,
              name: i['name'],
              value: i['value'],
              sort_order: sort_idx += 1,
              _destroy: i['_destroy']
          }
        end

        game.update!({initiatives_attributes: init_attrs})
        InitiativeHistory.where(game_id: game.id, names: names).update_all("use_count = use_count + 1")
        new_names.each do |name|
          InitiativeHistory.create!(game: game, name: name, use_count: 1)
        end

        game.initiatives.reload
        action_data['initiative'] = game.initiatives.as_json
      end
    end
  end
end