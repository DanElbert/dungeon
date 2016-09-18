class CampaignImage < Image
  belongs_to :campaign

  validates :campaign_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

end
