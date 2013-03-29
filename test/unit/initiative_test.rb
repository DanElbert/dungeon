require 'test_helper'

class InitiativeTest < ActiveSupport::TestCase

  test 'to_json' do
    init = Initiative.new
    init.name = 'Dan'
    init.value = 15
    init.sort_order = 2

    json = init.as_json
    assert json
    assert_equal 'Dan', json['name']
    assert_equal 15, json['value']
  end

  test 'from_message' do
    json = {'name' => 'Dan', 'value' => 15}

    init = Initiative.from_message(json, 2)

    assert_equal 'Dan', init.name
    assert_equal 15, init.value
    assert_equal 2, init.sort_order
  end

  test 'crud' do
    g = games(:one)

    g.initiatives << Initiative.from_message({'name' => 'Dan', 'value' => 15}, 2)
    g.initiatives << Initiative.from_message({'name' => 'Joe', 'value' => 20}, 1)

    g.save

    g = Game.find(g.id)

    assert_equal 2, g.initiatives.count
    assert_equal 'Joe', g.initiatives[0].name
  end
end
