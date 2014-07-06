class MigrateBoardsBackgroundImage < ActiveRecord::Migration

  class Image < ActiveRecord::Base
    self.inheritance_column = nil
  end

  def up
    Image.reset_column_information

    Dir[Rails.root.join('db', 'seed_data', 'background_images', '*')].each do |file|
      name = File.basename file
      unless Image.where(filename: name, type: 'BackgroundImage').exists?
        Image.create!({filename: name, type: 'BackgroundImage', data: File.binread(file)})
      end
    end

    bgs = Image.where(type: 'BackgroundImage').to_a

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
