require 'test_helper'

class BoardDrawingTest < ActiveSupport::TestCase
  test "some crud" do
    b = boards(:empty_game_board)

    b.board_drawing = BoardDrawing.new()
    b.board_drawing.board_drawing_data = BoardDrawingData.new()

    b.save()
  end
end
