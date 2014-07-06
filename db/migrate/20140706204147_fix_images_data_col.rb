class FixImagesDataCol < ActiveRecord::Migration
  def change
    change_column :images, :data, :binary, limit: 16.megabyte
  end
end
