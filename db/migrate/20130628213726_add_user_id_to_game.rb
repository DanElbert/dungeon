class AddUserIdToGame < ActiveRecord::Migration[4.2]
  def change
    add_column :games, :user_id, :integer
  end
end
