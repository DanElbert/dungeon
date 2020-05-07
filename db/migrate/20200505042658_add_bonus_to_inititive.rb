class AddBonusToInititive < ActiveRecord::Migration[6.0]

  class InitiativeHistoryMigrator < ActiveRecord::Base
    self.table_name = 'initiative_histories'
  end

  class CampaignMigrator < ActiveRecord::Base
    self.table_name = 'campaigns'
  end

  class GameMigrator < ActiveRecord::Base
    self.table_name = 'games'
  end

  def up
    execute 'DELETE FROM initiatives'

    add_column :initiatives, :bonus, :string
    add_column :initiatives, :campaign_id, :integer
    remove_column :initiatives, :game_id

    add_column :initiative_histories, :campaign_id, :integer

    InitiativeHistoryMigrator.reset_column_information
    CampaignMigrator.reset_column_information
    GameMigrator.reset_column_information

    CampaignMigrator.pluck(:id).each do |cid|
      histories = InitiativeHistoryMigrator.where(game_id: GameMigrator.where(campaign_id: cid))
      name_map = Hash.new { |h, k| h[k] = 0 }
      histories.each { |h| name_map[h.name] += h.use_count }

      name_map.each do |k, v|
        InitiativeHistoryMigrator.create!(campaign_id: cid, name: k, use_count: v)
      end
    end

    InitiativeHistoryMigrator.where(campaign_id: nil).delete_all
    remove_column :initiative_histories, :game_id
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

end
