class RemoveBoardActionType < ActiveRecord::Migration
  def change
    remove_column :board_actions, :type, :string
  end
end
