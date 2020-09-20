module ApplicationCable
  class Channel < ActionCable::Channel::Base
    # This prevents race conditions so that any initial message is transmitted after websocket is established
    # and both the pubsub subscription to redis and the ActionCable channel subscription have been confirmed
    def after_confirmation_sent
      # To be implemented by subclass for doing work after websocket has been
      # established and confirmed
    end

    def ensure_confirmation_sent
      super
      after_confirmation_sent if subscription_confirmation_sent?
    end
  end
end