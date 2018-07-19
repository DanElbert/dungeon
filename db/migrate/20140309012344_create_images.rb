class CreateImages < ActiveRecord::Migration[4.2]
  def change
    create_table :images do |t|
      t.integer :campaign_id
      t.string :filename
      t.binary :data

      t.timestamps
    end
  end
end
