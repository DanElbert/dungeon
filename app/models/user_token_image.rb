class UserTokenImage < Image

  validates :user_id, presence: true
  validates :name, presence: true, length: { maximum: 255 }

  default_values visible: true

end