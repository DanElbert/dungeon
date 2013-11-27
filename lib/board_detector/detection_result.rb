module BoardDetector
  class DetectionResult

    attr_accessor :was_board_found
    attr_accessor :items

    def initialize
      self.was_board_found = false
      self.items = []
    end
  end
end