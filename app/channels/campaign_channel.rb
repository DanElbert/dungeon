class CampaignChannel < ApplicationCable::Channel

  def subscribed
    @campaign = Campaign.find(params[:campaign_id])
    stream_for @campaign
  end

  def beckon(data)
    CampaignChannel.broadcast_to(@campaign, data)
  end

  def self.update_campaign(campaign)
    self.broadcast_to campaign, { campaign: campaign, action: 'updated' }
  end

end