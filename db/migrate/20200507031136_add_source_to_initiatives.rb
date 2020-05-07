class AddSourceToInitiatives < ActiveRecord::Migration[6.0]
  def change
    add_column :initiatives, :source, :string
  end
end
