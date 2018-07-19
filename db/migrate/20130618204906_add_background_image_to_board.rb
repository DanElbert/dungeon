class AddBackgroundImageToBoard < ActiveRecord::Migration[4.2]
  def change
    add_column :boards, :background_image, :string
  end
end
