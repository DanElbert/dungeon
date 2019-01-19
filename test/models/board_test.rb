require 'test_helper'

class BoardTest < ActiveSupport::TestCase
  test "board crud" do
    b = Board.create()
    b2 = Board.find(b.id)

    assert_equal b.id, b2.id
  end

  test "Basic json serialization" do
    b = Board.create()
    b.to_json
  end

end
