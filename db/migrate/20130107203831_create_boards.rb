class CreateBoards < ActiveRecord::Migration[4.2]
  def change
    create_table :boards do |t|
      t.string :type
      t.integer :game_id
      t.string :name

      t.timestamps
    end
  end
end
