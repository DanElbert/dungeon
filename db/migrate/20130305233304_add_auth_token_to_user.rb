class AddAuthTokenToUser < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :auth_token
    end
  end
end
