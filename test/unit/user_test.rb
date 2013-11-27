require File.expand_path('../../test_helper', __FILE__)

class UserTest < ActiveSupport::TestCase
  test "authenticate" do
    assert_equal users(:roland), User.authenticate('roland@tet.com', 'qwerty')
    assert !User.authenticate('roland@tet.com', 'qwerty2')
    assert_equal users(:eddie), User.authenticate('eddie@tet.com', 'qwerty2')
  end

  test "system user validation" do
    u = users(:roland)
    assert u.valid?

    u.email = User::SYSTEM_USER_EMAIL
    refute u.valid?
  end
end
