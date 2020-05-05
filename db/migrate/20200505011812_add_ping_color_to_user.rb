class AddPingColorToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :ping_color, :string
  end
end
