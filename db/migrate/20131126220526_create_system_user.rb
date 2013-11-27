class CreateSystemUser < ActiveRecord::Migration

  class User < ActiveRecord::Base
  end

  def up
    User.reset_column_information

    User.create!({email: 'dungeon@system.com', name: 'System', is_admin: true, password_digest: 'totally invalid', auth_token: UUID.new.generate(:compact)})
  end

  def down
    raise ActiveRecord::IrreversibleMigration.new
  end
end
