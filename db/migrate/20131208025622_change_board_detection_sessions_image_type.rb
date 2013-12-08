class ChangeBoardDetectionSessionsImageType < ActiveRecord::Migration
  def change
    change_table :board_detection_sessions do |t|
      t.remove :image
      t.binary :image, :limit => 16.megabyte
    end
  end
end
