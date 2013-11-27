module BoardDetector
  class Interface

    Feature = Struct.new(:x, :y, :width, :height)

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

      return_data = DetectionResult.new

      begin
        File.binwrite(image_filename, Base64.decode64(session.image))

        output_json = get_board_json(image_filename, session.pattern_size, session.pattern_dimension, session.detect_width, session.detect_height)

        if output_json
          return_data.was_board_found = true

          output_data = JSON.parse(output_json)

          output_data["items"].each do |item|
            obj = DetectedObject.new(
                item["center"][0] + session.detect_origin_x,
                item["center"][1] + session.detect_origin_y,
                item["size"],
                item["size"]
            )

            return_data.items << obj
          end
        end
      ensure
        if File.exist?(image_filename)
          File.delete(image_filename)
        end
      end

      return_data
    end

    private

    def find_board_file
      "#{Rails.root}/lib/board_detector/bin/find_board"
    end

    def get_board_json(image_location, pattern_size, pattern_dimension, width, height)
      cmd = "#{find_board_file} '#{image_location}' #{pattern_size} #{pattern_dimension} #{width} #{height}"
      Rails.logger.debug("Calling: #{cmd}")
      output = `#{cmd}`
      unless $? == 0
        Rails.logger.debug "Call to find_board failed"
        return nil
      end

      Rails.logger.debug "Output from find_board: #{output}"
      output
    end
  end
end