class Board < ActiveRecord::Base
  attr_accessible :name
  belongs_to :game
  has_many :board_pieces, :dependent => :destroy

  def add_piece(left, top, right, bottom)
    p = BoardPiece.new
    p.top = top
    p.left = left
    p.bottom = bottom
    p.right = right
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

  def board_extents
    max_bottom = 0
    max_right = 0

    board_pieces.each do |p|
      max_bottom = p.bottom if p.bottom > max_bottom
      max_right = p.right if p.right > max_right
    end
    [max_right, max_bottom]
  end

end
