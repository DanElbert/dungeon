class SeedArchiveCampaign < ActiveRecord::Migration
  class Campaign < ActiveRecord::Base
  end

  class Game < ActiveRecord::Base
  end

  def up
    Campaign.reset_column_information
    Game.reset_column_information
    c = Campaign.create!({name: "Archive"})
    Game.update_all("campaign_id = #{c.id}")
  end

end
