module BoardDetector
  class DetectionResult

    attr_accessor :was_board_found
    attr_accessor :items

    def initialize
      self.was_board_found = false
      self.items = []
    end

    def as_json
      {
          was_board_found: was_board_found,
          items: items.map { |i| i.as_json }
      }
    end
  end
end