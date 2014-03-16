module GameServer
  module MessageAuthentication

    def authenticate(message)
      is_valid = false

      if message['ext']
        user_id = message['ext']['user_id']
        auth_token = message['ext']['auth_token']
        is_valid = Rails.cache.fetch("user_auth_check") do
          User.where(:id => user_id, :auth_token => auth_token).exists?
        end
      end

      unless is_valid
        message['error'] = 'Authentication Failed'
      end

      is_valid
    end

    def remove_auth_attributes(message)
      if message['ext']
        message['ext']['user_id'] = nil
        message['ext']['auth_token'] = nil
      end
    end

    def add_auth_attributes(message, user)
      message['ext'] ||= {}
      message['ext']['user_id'] ||= user.id
      message['ext']['auth_token'] ||= user.auth_token
    end

  end
end