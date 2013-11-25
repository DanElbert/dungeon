
namespace :board_detector do

  task :build do |t|
    build_dir = "#{Rails.root}/lib/board_detector/build"
    source_dir = "#{Rails.root}/lib/board_detector/src"
    bin_dir = "#{Rails.root}/lib/board_detector/bin"
    `mkdir -p '#{build_dir}'`
    puts `cd '#{build_dir}' && cmake '#{source_dir}'`
    puts `cd '#{build_dir}' && make clean && make`
    puts `cp '#{build_dir}/find_board' '#{bin_dir}'`
  end

end