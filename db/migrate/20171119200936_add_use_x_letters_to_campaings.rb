class AddUseXLettersToCampaings < ActiveRecord::Migration[5.0]
  def change
    add_column :campaigns, :use_x_letters, :boolean
  end
end
