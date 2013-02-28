require File.expand_path('../config/environment', __FILE__)
require 'faye'
require File.expand_path('../lib/game_server', __FILE__)

game_server = Faye::RackAdapter.new(:mount => '/games', :timeout => 25)

router = GameServer::Router.new(game_server)

game_server.listen(GAME_SERVER_PORT)

