class AddBackgroundImageToBoard < ActiveRecord::Migration
  def change
    add_column :boards, :background_image, :string
  end
end
