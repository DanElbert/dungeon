require File.expand_path('../../test_helper', __FILE__)

class GamesControllerTest < ActionController::TestCase
  setup do
    @game = games(:one)
    set_current_user(users(:roland))
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create game" do
    assert_difference('Game.count') do
      post :create, { game: { status: @game.status, name: @game.name }, background_image: 'junk.jpg' }
    end

    assert_redirected_to game_path(assigns(:game))
  end

  test "should show game" do
    get :show, id: @game
    assert_response :success
  end
end