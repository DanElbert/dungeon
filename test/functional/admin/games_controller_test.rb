require File.expand_path('../../../test_helper', __FILE__)

module Admin
  class GamesControllerTest < ActionController::TestCase
    setup do
      @game = games(:one)
      set_current_user(users(:roland))
    end

    test "should get index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:games)
    end

    test "should show game" do
      get :show, id: @game
      assert_response :success
    end

    test "should get edit" do
      get :edit, id: @game
      assert_response :success
    end

    test "should update game" do
      put :update, id: @game, game: { status: @game.status }
      assert_redirected_to admin_game_path(assigns(:game))
    end

    test "should destroy game" do
      assert_difference('Game.count', -1) do
        delete :destroy, id: @game
      end

      assert_redirected_to admin_games_path
    end
  end
end
