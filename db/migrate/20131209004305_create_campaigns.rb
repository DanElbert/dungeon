class CreateCampaigns < ActiveRecord::Migration

  class Campaign < ActiveRecord::Base
  end

  def change
    create_table :campaigns do |t|

      t.string :name
      t.integer :user_id

      t.timestamps
    end

    add_column :games, :campaign_id, :integer

    Campaign.reset_column_information
    c = Campaign.create!({name: "Archive"})
    Campaign.connection.select_all("UPDATE games SET campaign_id = #{c.id}")
  end
end
