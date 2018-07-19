class DropBoardDrawing < ActiveRecord::Migration[4.2]
  def up
    drop_table :board_drawing_data
    drop_table :board_drawings
  end

  def down
    create_table :board_drawing_data do |t|
      t.integer :board_drawing_id
      t.binary :data

      t.timestamps
    end
    create_table :board_drawings do |t|
      t.integer :board_id
      t.integer :version

      t.timestamps
    end
  end
end
