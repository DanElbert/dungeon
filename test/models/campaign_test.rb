require 'test_helper'

class CampaignTest < ActiveSupport::TestCase
  test 'prevent deletion with games' do
    c = Campaign.new({name: 'test'})
    c.save!

    assert c.destroy

    c = Campaign.new({name: 'test'})
    c.save!
    c.games << games(:one)

    refute c.destroy
    assert Campaign.find(c.id)
  end

  test 'gm_users' do
    c = Campaign.create!(name: 'test', user: users(:roland))
    c.campaign_users << CampaignUser.new(is_gm: true, user: users(:eddie))
    c.campaign_users << CampaignUser.new(is_gm: false, user: users(:susannah))

    assert_same_elements [users(:roland), users(:eddie)], c.gm_users
  end

  test 'pc_users' do
    c = Campaign.create!(name: 'test', user: users(:roland))
    c.campaign_users << CampaignUser.new(is_gm: true, user: users(:eddie))
    c.campaign_users << CampaignUser.new(is_gm: false, user: users(:susannah))

    assert_same_elements [users(:roland), users(:eddie), users(:susannah)], c.pc_users
  end

  test '.for_user' do
    c1 = campaigns(:one)
    c2 = campaigns(:two)
    c3 = campaigns(:three)

    assert_same_elements [c1, c2], Campaign.for_user(users(:roland))
    assert_same_elements [c1, c2, c3], Campaign.for_user(users(:eddie))
    assert_same_elements [c1, c2, c3], Campaign.for_user(users(:susannah))
  end
end
