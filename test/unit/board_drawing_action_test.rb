require File.expand_path('../../test_helper', __FILE__)

class BoardDrawingActionTest < ActiveSupport::TestCase

  test "from_message" do
    message = {:actionType => "penAction", :uid => "a1b2", :color => "#00FF00", :width => 3, :lines => [
        {:start => [0,0], :end => [5,5]},
        {:start => [5,5], :end => [7,10]}]}

    action = BoardDrawingAction.from_message(message)

    assert_equal "a1b2", action.uid
    assert_equal "penAction", action.action_type
    assert action.properties && action.properties.length == 3
    assert_equal "#00FF00", action.properties["color"]
  end

  test "crud" do
    message = {:actionType => "penAction", :uid => "a1b2", :color => "#00FF00", :width => 3, :lines => [
        {:start => [0,0], :end => [5,5]},
        {:start => [5,5], :end => [7,10]}]}

    action = BoardDrawingAction.from_message(message)
    action.save!
    action = BoardDrawingAction.find(action.id)
    assert_equal "#00FF00", action.properties.color
  end

end
