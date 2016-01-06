# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

unless User.where(:email => 'dan.elbert@gmail.com').exists?
  dan = User.new({:email => "dan.elbert@gmail.com", :name => "Dan", :password => "qwerty", :password_confirmation => "qwerty", :is_admin => true})
  dan.save!
end

unless User.where(:email => 'dungeon@system.com').exists?
  system = User.new({:email => "dungeon@system.com", :name => "System", password_digest: 'totally invalid', :is_admin => true, auth_token: UUID.new.generate(:compact)})
  system.save!(validate: false)
end

Dir[Rails.root.join('db', 'seed_data', 'background_images', '*')].each do |file|
  name = File.basename file
  unless BackgroundImage.where(filename: name).exists?
    BackgroundImage.create!({filename: name, data: File.binread(file)})
  end
end