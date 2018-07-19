class AddNameToGame < ActiveRecord::Migration[4.2]
  def change
    change_table :games do |t|
      t.string :name
    end
  end
end
