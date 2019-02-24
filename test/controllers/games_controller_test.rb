require File.expand_path('../../test_helper', __FILE__)

class GamesControllerTest < ActionController::TestCase
  setup do
    @game = games(:one)
    @campaign = campaigns(:one)
    set_current_user(users(:roland))
  end

  test "should get new" do
    get :new, params: { campaign_id: @campaign }
    assert_response :success
  end

  test "should create game" do
    assert_difference('Game.count') do
      post :create, params: { campaign_id: @campaign, game: { status: @game.status, name: @game.name, board_attributes: {background_image_id: images(:bg).id} } }
    end

    assert_redirected_to game_path(assigns(:game))
  end

  test "should not allow get new for unauthorized campaign" do
    get :new, params: { campaign_id: campaigns(:three) }
    assert_redirected_to root_path
  end

  test "should not allow create for unauthorized campaign" do
    assert_no_difference('Game.count') do
      post :create, params: { campaign_id: campaigns(:three), game: { status: @game.status, name: @game.name, board_attributes: {background_image_id: images(:bg).id} } }
    end

    assert_redirected_to root_path
  end

  test "should show game" do
    get :show, params: {id: @game}
    assert_response :success
  end

  test "should get game data" do
    get :get_game_data, params: {id: @game}
    assert_response :success
  end
end