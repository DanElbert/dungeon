class InitiativeChannel < ApplicationCable::Channel

  def subscribed
    @campaign = Campaign.includes(:initiatives, :initiative_histories).find(params[:campaign_id])
    stream_for @campaign
    stream_for [session_id, @campaign]
  end

  def get_data
    InitiativeChannel.broadcast_to([session_id, @campaign], {
      'actionType' => 'updateInitiativeAction',
      'uid' => BoardAction.build_uid,
      'initiative' => @campaign.initiatives.as_json,
      'initiative_names' => @campaign.initiative_history_names
    })
  end

  def add_action(data)
    campaign = Campaign.includes(:initiatives, :initiative_histories).find(@campaign.id)
    action_data = data

    unless campaign
      message['error'] = "Invalid Campaign Id"
      return
    end

    campaign.transaction do
      extant_init_ids = campaign.initiatives.map(&:id)
      sort_idx = 0

      init_attrs = action_data['initiative'].map do |i|
        id = i['id'].to_i
        id = nil if id <= 0
        id = -1 if !id.nil? && !extant_init_ids.include?(id)
        {
            id: id,
            name: i['name'],
            value: i['value'],
            bonus: i['bonus'],
            source: i['source'],
            sort_order: sort_idx += 1,
            _destroy: i['_destroy']
        }
      end

      init_attrs.reject! { |i| i[:id] == -1}

      history_attrs = init_attrs.select { |i| !i[:_destroy] }.map { |i| i[:name] }.map do |n|
        extant_history = campaign.initiative_histories.detect { |h| h.name == n }
        {
            id: extant_history ? extant_history.id : nil,
            name: n,
            use_count: extant_history ? extant_history.use_count + 1 : 1
        }
      end


      campaign.update!({initiatives_attributes: init_attrs, initiative_histories_attributes: history_attrs})

      campaign.initiatives.reload
      action_data['initiative'] = campaign.initiatives.as_json
      action_data['initiative_names'] = campaign.initiative_history_names

    end

    InitiativeChannel.broadcast_to(@campaign, action_data)
  end

end
