class CreateCampaigns < ActiveRecord::Migration[4.2]

  def change
    create_table :campaigns do |t|

      t.string :name
      t.integer :user_id

      t.timestamps
    end

    add_column :games, :campaign_id, :integer
  end
end
