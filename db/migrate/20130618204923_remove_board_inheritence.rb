class RemoveBoardInheritence < ActiveRecord::Migration
  def change
    remove_column :boards, :type, :string
  end
end
