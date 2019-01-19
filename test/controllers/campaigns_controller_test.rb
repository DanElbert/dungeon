require 'test_helper'

class CampaignsControllerTest < ActionController::TestCase
  setup do
    @campaign = campaigns(:one)
    set_current_user(users(:roland))
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:campaigns)
    assert_same_elements [campaigns(:one), campaigns(:two)], assigns(:campaigns)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create campaign" do
    assert_difference('Campaign.count') do
      post :create, params: {campaign: { name: 'new camp' }}
    end

    assert_redirected_to campaign_path(assigns(:campaign))
  end

  test "should show campaign" do
    get :show, params: {id: @campaign}
    assert_response :success
  end

  test 'should not show unauthorized campaign' do
    get :show, params: {id: campaigns(:three)}
    assert_redirected_to root_path
  end

  test "should get edit" do
    get :edit, params: {id: @campaign}
    assert_response :success
  end

  test "should update campaign" do
    patch :update, params: {id: @campaign, campaign: { name: 'diff name' }}
    assert_redirected_to campaign_path(assigns(:campaign))
  end

  test "should destroy campaign" do
    assert_difference('Campaign.count', -1) do
      delete :destroy, params: {id: campaigns(:two)}
    end

    assert_redirected_to campaigns_path
  end
end
