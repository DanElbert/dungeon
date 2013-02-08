class BoardPiece < ActiveRecord::Base
  belongs_to :board

  attr_accessible :bottom, :left, :right, :top

  def width
    right - left + 1
  end

  def height
    bottom - top + 1
  end
end
