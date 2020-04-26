class DrawingImage < Image

  validates :campaign_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

end
