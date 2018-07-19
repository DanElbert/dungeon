class AddAuthTokenToUser < ActiveRecord::Migration[4.2]
  def change
    change_table :users do |t|
      t.string :auth_token
    end
  end
end
