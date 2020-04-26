class BackgroundImage < Image
  has_many :boards

  scope :for_campaign, ->(campaign) { where('campaign_id IS NULL OR campaign_id = ?', campaign).order(:filename) }

end
