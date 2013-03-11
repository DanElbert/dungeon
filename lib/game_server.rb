module GameServer

end

files = %w(
message_authentication
router
handler
add_action_handler
)

dir = File.expand_path('../', __FILE__)

files.each { |f| require "#{dir}/game_server/#{f}" }