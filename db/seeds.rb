# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

dan = User.new({:email => "dan.elbert@gmail.com", :name => "Dan", :password => "qwerty", :password_confirmation => "qwerty", :is_admin => true})
dan.save!
