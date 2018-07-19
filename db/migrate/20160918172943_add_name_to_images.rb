class AddNameToImages < ActiveRecord::Migration[4.2]
  def change
    add_column :images, :name, :string
  end
end
