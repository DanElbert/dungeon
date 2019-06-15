class InitiativeChannel < ApplicationCable::Channel

  def subscribed
    @game = Game.find(params[:game_id])
    stream_for @game
  end

  def add_action(data)
    game = Game.includes(:board, :initiatives, :initiative_histories).find(@game.id)
    action_data = data

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
        extant_history = game.initiative_histories.detect { |h| h.name == n }
        {
            id: extant_history ? extant_history.id : nil,
            name: n,
            use_count: extant_history ? extant_history.use_count + 1 : 1
        }
      end


      game.update!({initiatives_attributes: init_attrs, initiative_histories_attributes: history_attrs})

      game.initiatives.reload
      action_data['initiative'] = game.initiatives.as_json
      action_data['initiative_names'] = game.initiative_history_names

    end

    InitiativeChannel.broadcast_to(@game, action_data)
  end

end
