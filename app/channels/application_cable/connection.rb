module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      uid = request.session.fetch(:user_id, nil)
      user = User.find_by_id(uid) if uid
      reject_unauthorized_connection unless user
      self.current_user = user
    end
  end
end
