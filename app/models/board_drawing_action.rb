class BoardDrawingAction < BoardAction

  def self.from_message(message)
    action = BoardDrawingAction.new
    BoardAction.from_message(action, message)
  end

end
