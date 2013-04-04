class BoardPiece < ActiveRecord::Base
  belongs_to :board

  def width
    right - left + 1
  end

  def height
    bottom - top + 1
  end
end
