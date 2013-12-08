module GameServer
  class ServerClientExtension
    def initialize(user)
      @user = user
    end

    def outgoing(message, callback)
      message['ext'] ||= {}
      message['ext']['user_id'] = @user.id
      message['ext']['auth_token'] = @user.auth_token

      callback.call(message)
    end
  end
end