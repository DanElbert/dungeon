class AddUserIdToImage < ActiveRecord::Migration[5.2]
  def change
    add_column :images, :user_id, :integer
    add_column :images, :visible, :boolean
  end
end
