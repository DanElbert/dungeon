class AddCreatedAtIndexToActions < ActiveRecord::Migration[5.2]
  def change
    add_index :board_actions, :created_at
  end
end
