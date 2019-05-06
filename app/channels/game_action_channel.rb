class GameActionChannel < ApplicationCable::Channel

  COMPOSITE_ACTION_TYPE = 'compositeAction'

  def subscribed
    @game = Game.find(params[:game_id])
    stream_for @game
  end

  def add_action(data)
    process_action(data, @game)
    GameActionChannel.broadcast_to(@game, data)
  end

  private

  def process_action(action_data, game)

    if COMPOSITE_ACTION_TYPE == action_data['actionType']
      action_data['actionList'].each do |sub_action|
        process_action(sub_action, game)
      end
    end

    if action_data['isRemoval']
      BoardAction.where(:board_id => game.board, :uid => action_data['actionId']).destroy_all
    end

    if action_data['isPersistent']
      action = BoardAction.from_message(action_data)
      action.board = game.board
      action.save!
    end
  end

end