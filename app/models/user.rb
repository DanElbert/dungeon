class User < ActiveRecord::Base

  has_secure_password

  validates_presence_of :email
  validates_uniqueness_of :email

  before_create :set_auth_token

  def self.authenticate(email, password)
    find_by_email(email).try(:authenticate, password)
  end

  def set_auth_token
    self.auth_token = UUID.new.generate :compact
  end

end
