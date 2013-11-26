
task :compile do |t|
  Rake::Task['board_detector:build'].invoke
end
