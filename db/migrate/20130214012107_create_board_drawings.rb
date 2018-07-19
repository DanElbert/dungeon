class CreateBoardDrawings < ActiveRecord::Migration[4.2]
  def change
    create_table :board_drawings do |t|
      t.integer :board_id
      t.integer :version

      t.timestamps
    end
  end
end
