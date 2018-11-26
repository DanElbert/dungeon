module GameServer
  class UpdateInitiativeHandler < Handler

    CHANNEL_REGEX = /^\/game\/(\d+)\/update_initiative/

    def should_handle_message(channel)
      !channel.nil? && !!(CHANNEL_REGEX =~ channel)
    end

    def handle(message)
      # Assume that should_handle_message has already been called and this will always work
      game_id = CHANNEL_REGEX.match(message['channel'])[1].to_i

      game = Game.includes(:board, :initiatives, :initiative_histories).find(game_id)
      action_data = message['data']

      unless game
        message['error'] = "Invalid Game Id"
        return
      end

      game.transaction do
        extant_init_ids = game.initiatives.map(&:id)
        sort_idx = 0

        init_attrs = action_data['initiative'].map do |i|
          id = i['id'].to_i
          id = nil if id <= 0
          id = -1 if !id.nil? && !extant_init_ids.include?(id)
          {
              id: id,
              name: i['name'],
              value: i['value'],
              sort_order: sort_idx += 1,
              _destroy: i['_destroy']
          }
        end

        init_attrs.reject! { |i| i[:id] == -1}

        history_attrs = init_attrs.select { |i| !i[:_destroy] }.map { |i| i[:name] }.map do |n|
          extant_history = game.initiative_histories.detect { |h| h.name.downcase == n.downcase }
          {
              id: extant_history ? extant_history.id : nil,
              name: n,
              use_count: extant_history ? extant_history.use_count + 1 : 1
          }
        end


        game.update!({initiatives_attributes: init_attrs, initiative_histories_attributes: history_attrs})

        game.initiatives.reload
        game.initiative_histories.reload
        action_data['initiative'] = game.initiatives.as_json
        action_data['initiative_names'] = game.initiative_histories.map(&:name)

      end
    end
  end
end