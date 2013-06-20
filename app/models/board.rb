class Board < ActiveRecord::Base
  belongs_to :game
  has_many :board_actions, -> { order(:created_at) }, :dependent => :destroy

  def board_images
    imgs = [background_image].compact
    imgs.map { |i| {:name => i, :url => (@image_callback ? @image_callback.call(i) : i) } }
  end

  def cell_size
    50
  end

  def actions
    board_actions.map { |a| a.as_json }
  end

  def as_json(options={})
    @image_callback = options && options[:image_callback]
    opts = {:root => false,
            :except => [:game_id, :created_at, :updated_at],
            :methods => [:board_images, :cell_size, :actions]}.merge(options)
    super(opts)
  end

end
