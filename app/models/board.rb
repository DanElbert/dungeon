class Board < ActiveRecord::Base
  belongs_to :game
  has_many :board_pieces, :dependent => :destroy
  has_many :board_drawing_actions, -> { order(:created_at) }, :dependent => :destroy
  has_many :board_template_actions, -> { order(:created_at) }, :dependent => :destroy

  def add_piece(left, top, right, bottom, image)
    p = BoardPiece.new
    p.top = top
    p.left = left
    p.bottom = bottom
    p.right = right
    p.image = image
    board_pieces << p
    p
  end

  def board_extents
    max_bottom = 0
    max_right = 0

    board_pieces.each do |p|
      max_bottom = p.bottom if p.bottom > max_bottom
      max_right = p.right if p.right > max_right
    end
    [max_right, max_bottom]
  end

  def board_size
    board_extents.map { |c| (c + 1) * cell_size }
  end

  def board_images
    imgs = board_pieces.map { |p| p.image }.uniq
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
            :include => [:board_pieces => {:except => [:board_id, :created_at, :updated_at], :methods => [:width, :height]}],
            :methods => [:board_extents, :board_images, :cell_size, :drawing_actions, :template_actions]}.merge(options)
    super(opts)
  end

end
