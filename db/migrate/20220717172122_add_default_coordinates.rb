class AddDefaultCoordinates < ActiveRecord::Migration[7.0]
  def change
    add_column :boards, :default_coordinates_x, :integer
    add_column :boards, :default_coordinates_y, :integer
  end
end
