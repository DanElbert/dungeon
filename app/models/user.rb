class User < ApplicationRecord

  SYSTEM_USER_EMAIL = 'dungeon@system.com'

  has_many :campaigns
  has_many :campaign_users, inverse_of: :user, dependent: :delete_all

  scope :visible, -> { where("users.email <> ?", SYSTEM_USER_EMAIL) }

  has_secure_password

  validates :email,
            presence: true,
            format: { with: /\A.+@.+\z/, message: 'must be a valid email', allow_blank: true},
            uniqueness: { case_sensitive: false, allow_blank: true }

  validates :email,
            exclusion: { in: [SYSTEM_USER_EMAIL], message: "email '%{value}' is reserved.", allow_blank: true },
            if: :new_record?

  validates :username,
            format: { with: /\A[\w._-]+\z/, message: 'may only contain word characters, \'.\', \'_\', or \'-\'', allow_blank: true},
            uniqueness: { case_sensitive: false, allow_blank: true }

  before_create :set_auth_token

  def self.authenticate(email, password)
    where("email = ? OR username = ?", email, email).first.try(:authenticate, password)
  end

  def self.system_user
    begin
      where(email: SYSTEM_USER_EMAIL).first
    rescue
      nil
    end
  end

  def set_auth_token
    self.auth_token = SecureRandom.uuid
  end

  def as_json(opts = {})
    {
        id: self.id,
        name: self.name,
        username: self.username,
        display_name: self.display_name,
        ping_color: self.ping_color
    }
  end

end
