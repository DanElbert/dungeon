class AddIsDeletedToImages < ActiveRecord::Migration[6.0]

  class ImageMigrator < ActiveRecord::Base
    self.table_name = 'images'
  end

  def change
    add_column :images, :is_deleted, :boolean, index: true

    ImageMigrator.reset_column_information
    ImageMigrator.update_all(is_deleted: false)
  end
end
