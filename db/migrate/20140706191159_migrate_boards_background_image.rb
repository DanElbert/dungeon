class MigrateBoardsBackgroundImage < ActiveRecord::Migration

  class Image < ActiveRecord::Base
  end

  def up
    BackgroundImage.reset_column_information
    Board.reset_column_information

    Dir[Rails.root.join('db', 'seed_data', 'background_images', '*')].each do |file|
      name = File.basename file
      unless BackgroundImage.where(filename: name, type: 'BackgroundImage').exists?
        Image.create!({filename: name, type: 'BackgroundImage', data: File.binread(file)})
      end
    end

    bgs = BackgroundImage.all.to_a

    bgs.each do |bg|
      old_name = "board/backgrounds/#{bg.filename}"
      Board.where(background_image: old_name).update_all(background_image_id: bg.id)
    end


    remove_column :boards, :background_image
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
