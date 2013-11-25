module BoardDetector
  class Interface
    def initialize
      # Check that the binary exists
      raise 'Missing board_detector binaries' unless File.exist?(find_board_file)
    end

    def find_board_file
      "#{Rails.root}/lib/board_detector/bin/find_board"
    end

    def get_board_json(image_location, pattern_size, width, height)
      output = `#{find_board_file} '#{image_location}' #{pattern_size} #{width} #{height}`
      unless $? == 0
        return nil
      end

      output
    end
  end
end