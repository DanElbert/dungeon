class AddImageAttrs < ActiveRecord::Migration[5.2]
  def change
    add_column :images, :is_tiled, :boolean
    add_column :images, :tile_size, :integer
    add_column :images, :levels, :integer
    add_column :images, :status, :string
    add_column :images, :width, :integer
    add_column :images, :height, :integer
  end
end
