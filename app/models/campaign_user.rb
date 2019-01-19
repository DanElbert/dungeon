class CampaignUser < ApplicationRecord
  belongs_to :campaign, inverse_of: :campaign_users
  belongs_to :user, inverse_of: :campaign_users

  def as_json(opts = {})
    {
        id: self.id,
        user_id: self.user_id,
        is_gm: self.is_gm,
        campaign_id: self.campaign_id
    }
  end
end