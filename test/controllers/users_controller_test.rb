require File.expand_path('../../test_helper', __FILE__)

class UsersControllerTest < ActionController::TestCase

  setup do
    @user = users(:roland)
  end

  test "should get login" do
    get :login
    assert_response :success
  end

  test "can log in" do
    post :verify_login, params: {:email => @user.email, :password => "qwerty"}
    assert_redirected_to lobby_path
    assert_equal users(:roland).id, session[:user_id]
  end

  test "should get create user screen" do
    get :new
    assert_response :success
  end

  test "should create user" do
    assert_difference('User.count') do
      post :create, params: {user: { email: "somethingnew@blah.com", name: "Name", password: "qwerty1", password_confirmation: "qwerty1" }}
    end

    assert_redirected_to lobby_path
  end
end