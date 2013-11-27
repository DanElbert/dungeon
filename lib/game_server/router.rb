module GameServer
  class Router
    include MessageAuthentication

    def initialize(faye_server)
      @server = faye_server
      @server.add_extension(self)

      @client = @server.get_client
      @client.add_extension(ServerClientExtension.new(User.system_user))

      # List of handlers.  Should be in order of most specific to least, if there is any overlap in
      # the result of should_handle_message
      @handlers = [
          AddActionHandler.new(@server, @client),
          UpdateInitiativeHandler.new(@server, @client),
          BoardDetectionHandler.new(@server, @client)
      ]

    end

    def incoming(message, callback)
      if message['channel'] == '/meta/subscribe'
        authenticated = authenticate(message)

        if authenticated && get_handler(message['subscription'])
          Rails.logger.debug("New subscription to #{message['subscription']}")
        elsif authenticated
          Rails.logger.error("No handler for #{message['subscription']}")
          message['error'] = "Invalid Subscription"
        end
      else
        handler = get_handler(message['channel'])

        if handler
          handler.process_message(message)
        end

      end

      # always remove auth attributes before forwarding messages
      remove_auth_attributes(message)
      callback.call(message)
    end

    def get_handler(channel)

      return nil if channel.empty?

      #disallow wildcard subscriptions
      return nil if channel.index('*')

      @handlers.detect { |h| h.should_handle_message(channel) }
    end
  end
end