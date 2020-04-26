class RenameCampaignImageToDrawingImage < ActiveRecord::Migration[6.0]
  def up
    execute "UPDATE images SET type = 'DrawingImage' WHERE type = 'CampaignImage'"
  end

  def down
    execute "UPDATE images SET type = 'CampaignImage' WHERE type = 'DrawingImage'"
  end
end
