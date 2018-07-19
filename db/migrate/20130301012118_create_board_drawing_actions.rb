class CreateBoardDrawingActions < ActiveRecord::Migration[4.2]
  def change
    create_table :board_drawing_actions do |t|
      t.string :action_type
      t.string :uid
      t.text :properties

      t.timestamps
    end
  end
end
