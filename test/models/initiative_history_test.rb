require 'test_helper'

class InitiativeHistoryTest < ActiveSupport::TestCase

  test 'persistence' do
    x = InitiativeHistory.new
    x.game = games(:one)
    x.name = 'abc'
    x.use_count = 5
    x.save
  end
end
