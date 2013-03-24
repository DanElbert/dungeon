# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

dan = User.new({:email => "dan.elbert@gmail.com", :name => "Dan", :password => "qwerty", :password_confirmation => "qwerty", :is_admin => true}, :as => :admin)
dan.save!

marcus = User.new({:email => "marcus.maday@gmail.com", :name => "Marcus", :password => "qwerty", :password_confirmation => "qwerty", :is_admin => true}, :as => :admin)
marcus.save!

template1 = TemplateBoard.new({:name => "30x30 Gray"})
template1.add_piece(0, 0, 29, 29, "board/basic_2x2.png")
template1.save!

template2 = TemplateBoard.new({:name => "50x50 Stone"})
template2.add_piece(0, 0, 49, 49, "board/stone_tiles.jpg")
template2.save!

template3 = TemplateBoard.new({:name => "100x100 Descent"})
template3.add_piece(0, 0, 9, 9, "board/basic_2x2.png")
template3.add_piece(90, 90, 99, 99, "board/basic_2x2.png")
template3.add_piece(0, 90, 9, 99, "board/basic_2x2.png")
template3.add_piece(90, 0, 99, 9, "board/basic_2x2.png")

template3.add_piece(3, 10, 6, 89, "board/basic_2x2.png")
template3.add_piece(93, 10, 96, 89, "board/basic_2x2.png")
template3.add_piece(10, 3, 89, 6, "board/basic_2x2.png")
template3.add_piece(10, 93, 89, 96, "board/basic_2x2.png")
template3.save!

template4 = TemplateBoard.new({:name => "Small Descent"})
template4.add_piece(0, 0, 9, 9, "board/stone_tiles.jpg")
template4.add_piece(10, 4, 13, 5, "board/stone_tiles.jpg")
template4.add_piece(14, 0, 23, 9, "board/stone_tiles.jpg")
template4.save!

template5 = TemplateBoard.new({:name => "50x50 Grassy"})
template5.add_piece(0, 0, 49, 49, "board/dark_grass.jpg")
template5.save!

template5 = TemplateBoard.new({:name => "Tomb Test"})
template5.add_piece(0, 0, 75, 100, "board/concrete1.jpg")
template5.save!