class User < ApplicationRecord

  SYSTEM_USER_EMAIL = 'dungeon@system.com'

  has_many :campaigns

  has_secure_password

  validates :email,
            presence: true,
            format: { with: /\A.+@.+\z/, message: 'must be a valid email', allow_blank: true},
            uniqueness: { case_sensitive: false, allow_blank: true },
            exclusion: { in: [SYSTEM_USER_EMAIL], message: "email '%{value}' is reserved.", allow_blank: true }

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
    self.auth_token = UUID.new.generate :compact
  end

end
