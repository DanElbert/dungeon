class CreateBoardDrawingData < ActiveRecord::Migration[4.2]
  def change
    create_table :board_drawing_data do |t|
      t.integer :board_drawing_id
      t.binary :data

      t.timestamps
    end
  end
end
