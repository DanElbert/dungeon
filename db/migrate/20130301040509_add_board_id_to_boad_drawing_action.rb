class AddBoardIdToBoadDrawingAction < ActiveRecord::Migration[4.2]
  def change
    add_column :board_drawing_actions, :board_id, :integer
  end
end
