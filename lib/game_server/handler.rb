module GameServer

  # Base Message Handler class.  Subclasses are expected to override should_handle_message and handle
  class Handler
    include MessageAuthentication

    attr_accessor :server

    def initialize(server)
      self.server = server
    end

    def should_handle_message(channel)
      false
    end

    def handle(message)

    end

    def requires_authentication
      true
    end

    def process_message(message)

      if requires_authentication && !authenticate(message)
        return
      end

      handle(message)
    end
  end
end