class AddBackgroundImageIdToBoards < ActiveRecord::Migration
  def change
    add_column :boards, :background_image_id, :integer
  end
end
