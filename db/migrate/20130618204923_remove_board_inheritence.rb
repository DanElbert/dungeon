class RemoveBoardInheritence < ActiveRecord::Migration[4.2]
  def change
    remove_column :boards, :type, :string
  end
end
