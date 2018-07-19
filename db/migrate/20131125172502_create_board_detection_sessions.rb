class CreateBoardDetectionSessions < ActiveRecord::Migration[4.2]
  def change
    create_table :board_detection_sessions do |t|
      t.integer :game_id
      t.integer :detect_origin
      t.integer :detect_width
      t.integer :detect_height
      t.integer :image_orientation
      t.binary :image
      t.string :state

      t.timestamps
    end
  end
end
