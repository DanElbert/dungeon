class Campaign < ActiveRecord::Base
  has_many :games
  belongs_to :user

  def active_games
    self.games.to_a.select { |g| g.status == Game::STATUS[:active] }
  end

  def hidden_games
    self.games.to_a.select { |g| g.status == Game::STATUS[:hidden] }
  end

  def archived_games
    self.games.to_a.select { |g| g.status == Game::STATUS[:archived] }
  end

  def user_name
    user ? user.name : '<NONE>'
  end
end
