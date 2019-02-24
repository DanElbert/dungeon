class MigrateBoardsBackgroundImage < ActiveRecord::Migration[4.2]

  class Image < ActiveRecord::Base
    self.inheritance_column = nil
  end

  class Board < ActiveRecord::Base

  end

  def up
    Image.reset_column_information
    Board.reset_column_information

    Dir[Rails.root.join('db', 'seed_data', 'background_images', '*')].each do |file|
      name = File.basename file
      unless Image.where(filename: name, type: 'BackgroundImage').exists?
        i = Image.create!({filename: name, type: 'BackgroundImage', data: File.binread(file)})
        i.process!(true)
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
