class User < ActiveRecord::Base

  SYSTEM_USER_EMAIL = 'dungeon@system.com'

  has_many :campaigns

  has_secure_password

  validates_presence_of :email
  validates_uniqueness_of :email

  validates :email, exclusion: { in: [SYSTEM_USER_EMAIL], message: "email '%{value}' is reserved." }

  before_create :set_auth_token

  def self.authenticate(email, password)
    find_by_email(email).try(:authenticate, password)
  end

  def self.system_user
    where(email: SYSTEM_USER_EMAIL).first
  end

  def set_auth_token
    self.auth_token = UUID.new.generate :compact
  end

end
