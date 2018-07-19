class AddGridColorToBoard < ActiveRecord::Migration[4.2]
  def change
    add_column :boards, :grid_color, :string
  end
end
