module BoardDetector
  class Interface

    include EventMachine::Deferrable

    def initialize(session)
      # Check that the binary exists
      raise 'Missing board_detector binaries' unless File.exist?(find_board_file)

      image_filename = "#{Rails.root}/tmp/capture_session_image#{session.id}.png"

      operation_cmd = get_command(session, image_filename)

      File.binwrite(image_filename, Base64.decode64(session.image))

      operation_result = BoardDetector::DeferrableChildProcess.open(operation_cmd)

      operation_result.callback do |output, status|
        cleanup(image_filename)
        self.succeed(parse_output(session, output))
      end

      operation_result.errback do |status|
        cleanup(image_filename)
        self.succeed(parse_output(session, nil))
      end
    end

    private

    def get_command(session, file)
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

      "#{find_board_file} '#{file}' #{session.pattern_size} #{session.pattern_dimension} #{session.detect_width} #{session.detect_height}"
    end

    def parse_output(session, output)
      return_data = DetectionResult.new

      if output
        return_data.was_board_found = true

        output_data = JSON.parse(output)

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

      return_data
    end

    def find_board_file
      "#{Rails.root}/lib/board_detector/bin/find_board"
    end

    def cleanup(filename)
      if File.exist?(filename)
        File.delete(filename)
      end
    end

    def get_board_json(image_location, pattern_size, pattern_dimension, width, height)
      cmd = "#{find_board_file} '#{image_location}' #{pattern_size} #{pattern_dimension} #{width} #{height}"
      Rails.logger.debug("Calling: #{cmd}")
      output = `#{cmd}`
      puts output
      unless $? == 0
        Rails.logger.debug "Call to find_board failed"
        return nil
      end

      Rails.logger.debug "Output from find_board: #{output}"
      output
    end
  end
end