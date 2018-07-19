class AddImageToBoardPiece < ActiveRecord::Migration[4.2]
  def change
    change_table :board_pieces do |t|
      t.string :image
    end
  end
end
