module BoardDetector
  class Interface
    def initialize
      # Check that the binary exists
      raise 'Missing board_detector binaries' unless File.exist?(find_board_file)
    end

    def get_found_objects(session)
      required_fields = [
          :detect_width,
          :detect_height,
          :detect_origin_x,
          :detect_origin_y,
          :pattern_size,
          :pattern_dimension,
          :image,
          :image_orientation
      ]

      required_fields.each do |f|
        if session.send(f).blank?
          raise "Invalid BoardDetectionSession.  Missing #{f}"
        end
      end

      image_filename = "#{Rails.root}/tmp/capture_session_image#{session.id}.png"

      File.binwrite(image_filename, Base64.decode64(session.image))

      output_json = get_board_json(image_filename, session.pattern_size, session.detect_width, session.pattern_dimension, session.detect_height)

      if output_json
        output_data = JSON.parse(output_json)

        puts "Found #{output_data.items.length} items: "
        output_data.items.map do |item|
          # for now, assume find_board maps its coordinates into the size parameters
          trans = {center: [item.center[0] + session.detect_offset_x, item.center[1] + session.detect_offset_y], radius: item.size / 2 }
          puts "Item:"
          puts trans
          trans
        end
      else
        []
      end
    end

    def find_board_file
      "#{Rails.root}/lib/board_detector/bin/find_board"
    end

    def get_board_json(image_location, pattern_size, pattern_dimension, width, height)
      output = `#{find_board_file} '#{image_location}' #{pattern_size} #{pattern_dimension} #{width} #{height}`
      unless $? == 0
        return nil
      end

      output
    end
  end
end