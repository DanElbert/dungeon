module GameServer

  # Base Message Handler class.  Subclasses are expected to override should_handle_message and handle
  class Handler
    include MessageAuthentication

    attr_accessor :server, :client

    def initialize(server, client)
      self.server = server
      self.client = client
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

      begin
        handle(message)
      rescue StandardError => e
        Rails.logger.error "#{e.class}: #{e.message}\n    #{(e.backtrace || []).join("\n    ")}"
        message['error'] = e.to_s
        raise
      end
    end
  end
end