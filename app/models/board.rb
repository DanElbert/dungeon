class Board < ActiveRecord::Base
  attr_accessible :name
  belongs_to :game
  has_many :board_pieces, :dependent => :destroy
  has_one :board_drawing, :dependent => :destroy

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

  def build_item_array
    grid = empty_board_grid

    board_pieces.each do |p|
      (p.left..p.right).each do |x|
        (p.top..p.bottom).each do |y|
          grid[x][y] = "board"
        end
      end
    end

    grid
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
    board_pieces.map { |p| p.image }.uniq
  end

  def cell_size
    50
  end

  def drawing_version
    if self.board_drawing
      self.board_drawing.version
    else
      0
    end
  end

  def as_json(options={})
    opts = {:root => false,
            :except => [:game_id, :created_at, :updated_at],
            :include => [:board_pieces => {:except => [:board_id, :created_at, :updated_at], :methods => [:width, :height]}],
            :methods => [:board_extents, :board_images, :cell_size, :drawing_version]}.merge(options)
    super(opts)
  end

  private

  def empty_board_grid
    extents = board_extents
    grid = []
    (0..extents[0]).each do
      row = []
      (0..extents[1]).each do
        row << ""
      end
      grid << row
    end
    grid
  end

end
