require 'test_helper'
#require 'lib/board_detector'

class DetectedObjectTest < ActiveSupport::TestCase
  test 'row and column' do

    x = BoardDetector::DetectedObject.new(0, 0, 50, 50)
    assert_equal 0, x.row
    assert_equal 0, x.column

    x.x = 40
    x.y = 40

    assert_equal 0, x.row
    assert_equal 0, x.column

    x.x = -40
    x.y = -40

    assert_equal -1, x.row
    assert_equal -1, x.column
  end
end
