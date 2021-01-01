class SendInitiativeJob < ApplicationJob
  queue_as :default

  def perform(session_id, campaign)
    InitiativeChannel.broadcast_to([session_id, campaign], {
      'actionType' => 'updateInitiativeAction',
      'uid' => BoardAction.build_uid,
      'initiative' => campaign.initiatives.as_json,
      'initiative_names' => campaign.initiative_history_names
    })
  end
end