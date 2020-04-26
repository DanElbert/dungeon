class TokenImage < Image
  include DefaultValues

  belongs_to :campaign
  belongs_to :user

  validates :campaign_id, presence: true
  validates :user_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

  default_values visible: false
end