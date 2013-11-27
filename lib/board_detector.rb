module BoardDetector
end

files = %w(
interface
detected_object
detection_result
)

dir = File.expand_path('../', __FILE__)

files.each { |f| require "#{dir}/board_detector/#{f}" }