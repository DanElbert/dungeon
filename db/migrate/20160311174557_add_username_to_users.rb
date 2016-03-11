class AddUsernameToUsers < ActiveRecord::Migration
  def change
    add_column :users, :username, :string, index: true
    add_index :users, :email
  end
end
