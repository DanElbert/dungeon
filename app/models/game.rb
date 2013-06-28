class Game < ActiveRecord::Base

  STATUS = {:open => 'open', :active => 'active', :old => 'old'}

  has_one :board, :dependent => :destroy
  has_many :initiatives, -> { order(:sort_order) }, :dependent => :destroy
  belongs_to :user

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

  def is_owner(current_user_id)
    puts "==============="
    puts current_user_id
    puts self.user_id
    puts current_user_id == self.user_id
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
