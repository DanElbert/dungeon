class BoardDrawingData < ActiveRecord::Base
  attr_accessible :data

  belongs_to :board_drawing
end
