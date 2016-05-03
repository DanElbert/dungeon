class AddGridColorToBoard < ActiveRecord::Migration
  def change
    add_column :boards, :grid_color, :string
  end
end
