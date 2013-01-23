class User < ActiveRecord::Base

  has_secure_password
  attr_accessible :email, :name, :password, :password_confirmation
  attr_accessible :email, :name, :password, :password_confirmation, :is_admin, :as => :admin

  validates_presence_of :email
  validates_uniqueness_of :email

  def self.authenticate(email, password)
    find_by_email(email).try(:authenticate, password)
  end

end
