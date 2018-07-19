class RemoveBoardActionType < ActiveRecord::Migration[4.2]
  def change
    remove_column :board_actions, :type, :string
  end
end
