class AddIndices < ActiveRecord::Migration[5.2]
  def change

    add_index :images, :type
    add_index :images, :campaign_id
    add_index :board_actions, :board_id
    add_index :board_actions, :uid
    add_index :boards, :game_id
    add_index :games, :campaign_id

  end
end
