require 'rubygems'
require 'faye'
require File.expand_path('../config/environment', __FILE__)

puts Board.count

game_server = Faye::RackAdapter.new(:mount => '/games', :timeout => 25)
game_server.listen(9292)