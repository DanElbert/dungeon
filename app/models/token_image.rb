class TokenImage < Image

  validates :campaign_id, presence: true
  validates :user_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

end