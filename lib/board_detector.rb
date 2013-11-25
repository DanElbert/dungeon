module BoardDetector
end

files = %w(
interface
)

dir = File.expand_path('../', __FILE__)

files.each { |f| require "#{dir}/board_detector/#{f}" }