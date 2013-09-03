class Game < ActiveRecord::Base

  STATUS = {:open => 'open', :active => 'active', :old => 'old'}

  has_one :board, :dependent => :destroy
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy
  has_many :initiative_histories, dependent: :destroy
  belongs_to :user

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
    current_user_id == self.user_id
  end

  def as_json(options = {})
    {
        :name => name,
        :status => status,
        :is_owner => is_owner(options[:current_user_id]),
        :board => board.as_json(options.slice(:image_callback)),
        :initiative => initiatives.to_a.map { |i| {:name => i.name, :value => i.value} }
    }
  end

end
