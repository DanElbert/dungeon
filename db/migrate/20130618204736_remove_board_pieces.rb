class RemoveBoardPieces < ActiveRecord::Migration[4.2]
  def up
    drop_table :board_pieces
  end

  def down
    create_table :board_pieces do |t|
      t.string :type
      t.integer :board_id
      t.integer :top
      t.integer :bottom
      t.integer :left
      t.integer :right

      t.timestamps
    end
  end
end
