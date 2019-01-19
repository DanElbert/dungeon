class CampaignUser < ApplicationRecord
  belongs_to :campaign, inverse_of: :campaign_users
  belongs_to :user, inverse_of: :campaign_users
end