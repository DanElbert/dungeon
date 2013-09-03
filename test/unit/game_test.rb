require 'test_helper'

class GameTest < ActiveSupport::TestCase
  test 'update initiative counts' do
    game = Game.new(name: 'test game', board: Board.new())
    game.save!

    assert game.initiative_histories.size == 0

    game.update_initiative_counts(['a', 'b', 'c'])
    game.reload

    assert_equal 3, game.initiative_histories.size

    game.update_initiative_counts(['a', 'c'])
    game.reload

    assert_equal 3, game.initiative_histories.size

    game.update_initiative_counts(['a', 'd'])
    game.reload

    assert_equal 4, game.initiative_histories.size

    histories = InitiativeHistory.where(game_id: game.id).order(:name).to_a
    assert_equal 3, histories[0].use_count
    assert_equal 1, histories[1].use_count
    assert_equal 2, histories[2].use_count
    assert_equal 1, histories[3].use_count
  end
end
