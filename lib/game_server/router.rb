module GameServer
  class Router
    def initialize(faye_server)
      @server = faye_server
      @server.add_extension(self)

      # Map of handlers. "/game/add_action" might have something like:
      #  {:game => {:add_action => HandlerClass.new }}
      @handlers = {
          :game => {
              :add_action => AddActionHandler.new
          }
      }

    end

    def incoming(message, callback)
      if message['channel'] == '/meta/subscribe'
        if get_handler(message['subscription'])
          #puts "New subscription to #{message['subscription']}"
        else
          #puts "No handler for #{message['subscription']}"
          message['error'] = "Invalid Subscription"
        end
      else

        handler = get_handler(message['channel'])

        if handler
          handler.process_message(message)
        end

      end

      callback.call(message)
    end

    def get_handler(channel)

      return nil if channel.empty?

      #disallow wildcard subscriptions
      return nil if channel.index('*')

      parts = channel.split('/').delete_if { |p| p.empty? }

      x = @handlers

      parts.each do |p|
        unless x.is_a? Hash
          x = nil
          return false
        end
        x = x[p.to_sym]
        return false unless x
      end

      x
    end

  end
end