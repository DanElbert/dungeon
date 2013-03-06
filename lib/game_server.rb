module GameServer

end

dir = File.expand_path('../', __FILE__)
require "#{dir}/game_server/message_authentication"
require "#{dir}/game_server/router"
require "#{dir}/game_server/handler"
require "#{dir}/game_server/add_action_handler"