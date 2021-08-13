class MigrationActionProperties < ActiveRecord::Migration[5.2]

  class BoardActionMigrator < ActiveRecord::Base
    self.table_name = 'board_actions'
    serialize :properties_old
  end

  def up
    rename_column :board_actions, :properties, :properties_old
    add_column :board_actions, :properties, :jsonb

    BoardActionMigrator.reset_column_information

    BoardActionMigrator.transaction do
      BoardActionMigrator.find_each do |ba|
        ba.update(properties: ba.properties_old)
      end
    end

    remove_column :board_actions, :properties_old
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
