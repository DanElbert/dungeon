module BoardDetector
  class Interface

    include EventMachine::Deferrable

    attr_accessor :debug

    def initialize(session)
      # Check that the binary exists
      raise 'Missing board_detector binaries' unless File.exist?(find_board_file)

      @session = session
      validate_session

      @image_filename = "#{Rails.root}/tmp/capture_session_image#{@session.id}.png"
      File.binwrite(@image_filename, Base64.decode64(@session.image))
    end

    def async
      operation_cmd = get_command(@session, @image_filename)

      Rails.logger.debug("Calling: \n#{operation_cmd}")

      operation_result = BoardDetector::DeferrableChildProcess.open(operation_cmd)

      operation_result.callback do |output, status|
        Rails.logger.debug "Output from find_board:\n#{output}"
        cleanup
        self.succeed(parse_output(output))
      end

      operation_result.errback do |status|
        Rails.logger.error "Call to find_board failed: #{output}"
        cleanup
        self.succeed(parse_output(nil))
      end
    end

    def sync
      cmd = get_command(@session, @image_filename)
      Rails.logger.debug("Calling: \n#{cmd}")
      output = `#{cmd}`
      Rails.logger.debug "Output from find_board:\n#{output}"
      unless $? == 0
        Rails.logger.error "Call to find_board failed"
        output = nil
      end

      parse_output(output)
    end

    private

    def validate_session
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
        if @session.send(f).blank?
          raise "Invalid BoardDetectionSession.  Missing #{f}"
        end
      end
    end

    def get_command(session, file)
      "#{find_board_file} '#{file}' #{session.pattern_size} #{session.pattern_dimension} #{session.detect_width} #{session.detect_height}"
    end

    def parse_output(output)
      return_data = DetectionResult.new

      if output
        return_data.was_board_found = true

        output_data = JSON.parse(output)

        output_data["items"].each do |item|
          obj = DetectedObject.new(
              item["center"][0] + @session.detect_origin_x,
              item["center"][1] + @session.detect_origin_y,
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

    def cleanup
      if File.exist?(@image_filename)
        File.delete(@image_filename)
      end
    end
  end
end