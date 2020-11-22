class Campaign < ApplicationRecord

  before_destroy :check_for_games

  has_many :games
  belongs_to :user
  has_many :drawing_images, dependent: :delete_all
  has_many :token_images, dependent: :delete_all
  has_many :background_images, dependent: :delete_all
  has_many :campaign_users, -> { includes(:user) }, inverse_of: :campaign, dependent: :delete_all
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy, :inverse_of => :campaign
  has_many :initiative_histories, -> { order(use_count: :desc) }, dependent: :destroy, :inverse_of => :campaign

  scope :for_user, ->(user) { where("campaigns.requires_authorization = :false OR campaigns.requires_authorization IS NULL OR campaigns.user_id = :user OR :user IN (SELECT user_id FROM campaign_users WHERE campaign_users.campaign_id = campaigns.id)", user: user, false: false) }

  accepts_nested_attributes_for :campaign_users, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :initiatives, allow_destroy: true
  accepts_nested_attributes_for :initiative_histories

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

  def gm_users
    campaign_users.to_a.select(&:is_gm?).map(&:user) + [user]
  end

  def pc_users
    campaign_users.to_a.map(&:user) + [user]
  end

  def is_gm?(user)
    gm_users.include?(user)
  end

  def is_pc?(user)
    !self.requires_authorization || pc_users.include?(user)
  end

  def initiative_history_names
    self.initiative_histories.map { |h| h.name }
  end

  def as_json(options = nil)
    {
      id: self.id,
      name: self.name,
      user_name: self.user_name,
      games: self.games.map { |g| {id: g.id, name: g.name, created_at: g.created_at, status: g.status}  }
    }
  end

  private

  def check_for_games
    if games.count > 0
      errors.add(:base, "Delete All Games First")
      throw :abort
    end
  end
end
