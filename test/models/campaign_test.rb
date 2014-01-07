require 'test_helper'

class CampaignTest < ActiveSupport::TestCase
  test 'prevent deletion with games' do
    c = Campaign.new({name: 'test'})
    c.save!

    assert c.destroy

    c = Campaign.new({name: 'test'})
    c.save!
    c.games << Game.new({name: 'test', board: Board.new({})})

    refute c.destroy
    assert Campaign.find(c.id)
  end
end
