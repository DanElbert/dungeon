class FixSomeBs < ActiveRecord::Migration[6.0]

  class BoardActionMigrator < ActiveRecord::Base
    self.table_name = 'board_actions'
  end

  def up
    BoardActionMigrator.reset_column_information

    BoardActionMigrator.transaction do
      BoardActionMigrator.find_each do |ba|
        if ba.properties.is_a?(String)
          ba.properties = YAML.load(ba.properties)
          ba.save!
        end
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
