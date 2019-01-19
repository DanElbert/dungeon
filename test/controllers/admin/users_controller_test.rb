require File.expand_path('../../../test_helper', __FILE__)

module Admin
  class UsersControllerTest < ActionController::TestCase
    setup do
      @user = users(:roland)
      set_current_user(@user)
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:users)
    end

    test "should get new" do
      get :new
      assert_response :success
    end

    test "should create user" do
      assert_difference('User.count') do
        post :create, params: {user: { email: "somethingnew@blah.com", name: "Name", password: "qwerty1", password_confirmation: "qwerty1" }}
      end

      assert_redirected_to admin_user_path(assigns(:user))
    end

    test "should show user" do
      get :show, params: {id: @user}
      assert_response :success
    end

    test "should get edit" do
      get :edit, params: {id: @user}
      assert_response :success
    end

    test "should update user" do
      put :update, params: {id: @user, user: { email: @user.email, name: @user.name, password: @user.password, password_confirmation: @user.password }}
      assert_redirected_to admin_user_path(assigns(:user))
    end

    test "should destroy user" do
      assert_difference('User.count', -1) do
        delete :destroy, params: {id: @user}
      end

      assert_redirected_to admin_users_path
    end
  end
end