class AddBoardIdToBoadDrawingAction < ActiveRecord::Migration
  def change
    add_column :board_drawing_actions, :board_id, :integer
  end
end
