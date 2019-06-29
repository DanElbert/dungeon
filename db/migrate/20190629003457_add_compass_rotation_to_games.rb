class AddCompassRotationToGames < ActiveRecord::Migration[5.2]
  def change
    add_column :boards, :compass_rotation, :integer
  end
end
