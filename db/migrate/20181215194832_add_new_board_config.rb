class AddNewBoardConfig < ActiveRecord::Migration[5.2]
  def change
    change_table :boards do |t|
      t.integer :default_zoom
      t.integer :cell_size_pixels
      t.integer :cell_size_feet
      t.string :template_type
    end
  end
end
