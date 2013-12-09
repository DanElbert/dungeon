class Campaign < ActiveRecord::Base
  has_many :games
  belongs_to :user

  def user_name
    user ? user.name : '<NONE>'
  end
end
