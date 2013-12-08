
namespace :board_detector do

  build_directory = "#{Rails.root}/lib/board_detector/build"
  source_directory = "#{Rails.root}/lib/board_detector/src"
  bin_directory = "#{Rails.root}/lib/board_detector/bin"
  cmake_file = "#{source_directory}/CMakeLists.txt"
  make_file = "#{build_directory}/Makefile"

  directory build_directory

  file make_file => [build_directory, cmake_file] do
    puts `cd '#{build_directory}' && cmake '#{source_directory}'`
  end

  task :build_find_board => [make_file] do
    puts `cd '#{build_directory}' && make clean && make`
    puts `cp '#{build_directory}/find_board' '#{bin_directory}'`
  end

  task :build => [:build_find_board] do |t|
  end

end