require File.expand_path('../game_server', __FILE__)

Faye::WebSocket.load_adapter('thin')

class GameServerMiddleware
  def initialize(app, options = {})
    raise "No GameServer mount point specified" unless options.key? :mount

    #Faye.logger = Rails.logger

    @faye_rack_adapter = Faye::RackAdapter.new(app, options)
    @router = GameServer::Router.new(@faye_rack_adapter)
  end

  def call(env)
    @faye_rack_adapter.call(env)
  end
end