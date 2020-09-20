module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user, :session_id

    def connect
      uid = request.session.fetch(:user_id, nil)
      sid = request.session.fetch(:session_id, nil)
      user = User.find_by_id(uid) if uid
      reject_unauthorized_connection unless (user && sid)
      self.current_user = user
      self.session_id = sid
    end
  end
end
