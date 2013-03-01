require 'test_helper'

class BoardTest < ActiveSupport::TestCase
  test "template board crud" do
    b = TemplateBoard.create()
    b2 = Board.find(b.id)

    assert_equal b.id, b2.id
    assert_equal TemplateBoard, b2.class
  end

  test "Basic json serialization" do
    b = TemplateBoard.create()
    b.add_piece(0, 0, 4, 9, "img.png")
    b.add_piece(5, 0, 9, 2, "img.png")
    b.to_json
  end
end
