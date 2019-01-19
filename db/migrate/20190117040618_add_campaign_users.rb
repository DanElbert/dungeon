class AddCampaignUsers < ActiveRecord::Migration[5.2]
  def change
    create_table :campaign_users do |t|
      t.integer :campaign_id, null: false, index: true
      t.integer :user_id, null: false, index: true
      t.boolean :is_gm
    end

    add_column :campaigns, :requires_authorization, :boolean
  end
end
