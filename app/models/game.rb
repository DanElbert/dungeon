class Game < ApplicationRecord

  STATUS = {:active => 'active', :hidden => 'hidden', :archived => 'archived', :deleted => 'deleted'}

  has_one :board, :dependent => :destroy
  has_many :board_detection_sessions, :dependent => :destroy
  belongs_to :campaign

  accepts_nested_attributes_for :board, update_only: true

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
    user = User.find(options[:current_user_id])
    {
        :name => name,
        :campaign_id => self.campaign_id,
        :status => status,
        :is_owner => is_owner(options[:current_user_id]),
        :board => board.as_json(),
        :initiative => self.campaign.initiatives.as_json,
        :initiative_names => self.campaign.initiative_history_names,
        :drawing_images => campaign.drawing_images.active.without_data.to_a.map(&:as_json),
        :token_images => UserTokenImage.for_user(options[:current_user_id]).without_data.to_a.map(&:as_json) + campaign.token_images.active.without_data.to_a.map(&:as_json),
        :useXLetters => campaign.use_x_letters.nil? ? true : campaign.use_x_letters,
        :default_ping_color => user.ping_color
    }
  end

end
