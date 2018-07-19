class AddColumnsToBoardDetectionSessions < ActiveRecord::Migration[4.2]
  def change
    change_table :board_detection_sessions do |t|
      t.remove :detect_origin
      t.integer :detect_origin_x
      t.integer :detect_origin_y
      t.integer :pattern_size
      t.integer :pattern_dimension
    end
  end
end
