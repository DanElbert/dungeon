class CreateInitiativeHistories < ActiveRecord::Migration[4.2]
  def change
    create_table :initiative_histories do |t|
      t.integer :game_id
      t.string :name
      t.integer :use_count

      t.timestamps

      t.index :game_id
      t.index :name
    end
  end
end
