class CreateInitiatives < ActiveRecord::Migration
  def change
    create_table :initiatives do |t|
      t.integer :game_id
      t.string :name
      t.integer :value
      t.integer :sort_order

      t.timestamps
    end
  end
end
