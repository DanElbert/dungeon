class Board < ActiveRecord::Base
  belongs_to :game
  has_many :board_drawing_actions, -> { order(:created_at) }, :dependent => :destroy
  has_many :board_template_actions, -> { order(:created_at) }, :dependent => :destroy

  def board_images
    imgs = [background_image].compact
    imgs.map { |i| {:name => i, :url => (@image_callback ? @image_callback.call(i) : i) } }
  end

  def cell_size
    50
  end

  def drawing_actions
    board_drawing_actions.map { |a| a.as_json }
  end

  def template_actions
    board_template_actions.map { |a| a.as_json }
  end

  def as_json(options={})
    @image_callback = options && options[:image_callback]
    opts = {:root => false,
            :except => [:game_id, :created_at, :updated_at],
            :methods => [:board_images, :cell_size, :drawing_actions, :template_actions]}.merge(options)
    super(opts)
  end

end
