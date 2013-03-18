class CreateBoardTemplateActions < ActiveRecord::Migration
  def change
    rename_table :board_drawing_actions, :board_actions

    add_column :board_actions, :type, :string
  end
end
