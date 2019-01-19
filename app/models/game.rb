class Game < ApplicationRecord

  STATUS = {:active => 'active', :hidden => 'hidden', :archived => 'archived', :deleted => 'deleted'}

  has_one :board, :dependent => :destroy
  has_many :board_detection_sessions, :dependent => :destroy
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy, :inverse_of => :game
  has_many :initiative_histories, -> { order(use_count: :desc) }, dependent: :destroy, :inverse_of => :game
  belongs_to :campaign

  accepts_nested_attributes_for :board, update_only: true
  accepts_nested_attributes_for :initiatives, allow_destroy: true
  accepts_nested_attributes_for :initiative_histories

  validates :board, :presence => true
  validates :name, :presence => true

  def background_image
    board ? board.background_image : nil
  end

  def background_image=(val)
    if board
      board.background_image = val
    end
  end

  def update_initiative_counts(names)
    histories = InitiativeHistory.where(game_id: self.id, name: names).to_a
    histories.each { |h| h.use_count += 1; h.save! }
    history_names = histories.map { |h| h.name.downcase }

    names.reject { |n| history_names.include? n.downcase }.each do |n|
      h = InitiativeHistory.new({game: self, name: n, use_count: 1})
      h.save!
    end
  end

  def is_owner(current_user_id)
    current_user_id == self.campaign.user_id
  end

  def is_gm?(user)
    self.campaign.is_gm?(user)
  end

  def is_pc?(user)
    self.campaign.is_pc?(user)
  end

  def user_id
    self.campaign.user_id if self.campaign
  end

  def as_json(options = {})
    {
        :name => name,
        :status => status,
        :is_owner => is_owner(options[:current_user_id]),
        :board => board.as_json(),
        :initiative => initiatives.to_a.map { |i| {:id => i.id, :name => i.name, :value => i.value} },
        :initiative_names => initiative_histories.order(use_count: :desc).pluck(:name),
        :campaign_images => campaign.campaign_images.to_a.map(&:as_json),
        :useXLetters => campaign.use_x_letters.nil? ? true : campaign.use_x_letters
    }
  end

end
