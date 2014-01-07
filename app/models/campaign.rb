class Campaign < ActiveRecord::Base
  has_many :games
  belongs_to :user

  before_destroy :check_for_games

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

  private

  def check_for_games
    if games.count > 0
      errors.add(:base, "Delete All Games First")
      false
    end
  end
end
