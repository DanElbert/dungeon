class AddTypeToImages < ActiveRecord::Migration[4.2]
  def change
    add_column :images, :type, :string
  end
end
