class CreateTokens < ActiveRecord::Migration[4.2]
  def change
    create_table :tokens do |t|
      t.integer :game_id
      t.string :token_type
      t.integer :position_x
      t.integer :position_y
      t.string :name
      t.integer :height
      t.integer :width
      t.text :properties

      t.timestamps
    end
  end
end
