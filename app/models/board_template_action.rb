class BoardTemplateAction < BoardAction

  def self.from_message(message)
    action = BoardTemplateAction.new
    BoardAction.from_message(action, message)
  end

end
