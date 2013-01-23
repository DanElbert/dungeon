class BoardPiece < ActiveRecord::Base
  belongs_to :board

  attr_accessible :bottom, :left, :right, :top
end
