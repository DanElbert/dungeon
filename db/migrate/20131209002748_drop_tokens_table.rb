class DropTokensTable < ActiveRecord::Migration[4.2]
  def change
    drop_table :tokens
  end
end
