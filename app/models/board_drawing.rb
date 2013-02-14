class BoardDrawing < ActiveRecord::Base
  attr_accessible :version

  belongs_to :board
  has_one :board_drawing_data, :dependent => :destroy

  after_initialize :init

  def init
    self.version ||= 0 if self.version
  end

  def set_data(data)
    unless self.board_drawing_data
      self.board_drawing_data = BoardDrawingData.new
    end

    self.board_drawing_data = data
    self.version += 1
  end

end
