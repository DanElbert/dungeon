require 'test_helper'

class BoardTest < ActiveSupport::TestCase
  test "template board crud" do
    b = TemplateBoard.create()
    b2 = Board.find(b.id)

    assert_equal b.id, b2.id
    assert_equal TemplateBoard, b2.class
  end

  test "build_item_array with single square" do
    b = TemplateBoard.create()
    b.add_piece(0, 0, 9, 9)

    board = b.build_item_array

    assert_equal 10, board.count
    assert_equal 10, board[0].count
    assert_equal "board", board[0][0]

  end

  test "build_item_array with single rectangle" do
    b = TemplateBoard.create()
    b.add_piece(0, 0, 4, 9)

    board = b.build_item_array

    assert_equal 5, board.count
    assert_equal 10, board[0].count
    assert_equal "board", board[0][0]
  end

  test "build_item_array with two rectangles" do
    b = TemplateBoard.create()
    b.add_piece(0, 0, 4, 9)
    b.add_piece(5, 0, 9, 2)

    board = b.build_item_array

    assert_equal 10, board.count
    assert_equal 10, board[0].count
    assert_equal "board", board[0][0]
  end

  test "Basic json serialization" do
    b = TemplateBoard.create()
    b.add_piece(0, 0, 4, 9)
    b.add_piece(5, 0, 9, 2)
    b.to_json
  end
end
