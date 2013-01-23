class AddNameToGame < ActiveRecord::Migration
  def change
    change_table :games do |t|
      t.string :name
    end
  end
end
