class CreateBoardPieces < ActiveRecord::Migration[4.2]
  def change
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
