
task :compile do |t|
  Rake::Task['board_detector:build'].invoke
end

task :check do
  puts `pwd`
end