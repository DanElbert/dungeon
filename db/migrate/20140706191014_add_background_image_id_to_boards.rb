class AddBackgroundImageIdToBoards < ActiveRecord::Migration[4.2]
  def change
    add_column :boards, :background_image_id, :integer
  end
end
