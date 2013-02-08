class AddImageToBoardPiece < ActiveRecord::Migration
  def change
    change_table :board_pieces do |t|
      t.string :image
    end
  end
end
