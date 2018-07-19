class FixImagesDataCol < ActiveRecord::Migration[4.2]
  def change
    change_column :images, :data, :binary, limit: 16.megabyte
  end
end
