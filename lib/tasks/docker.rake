
namespace :docker do

  task :init do

    unless system 'docker ps'
      raise 'Unable to execute Docker commands.  Ensure you have access'
    end

    unless system 'docker inspect dungeon_db_data'
      puts 'Creating data container...'
      system 'docker create -v /var/lib/mysql -v /data --name dungeon_db_data mysql:latest'
    end

    `cd '#{Rails.root}' && fig build`
    `cd '#{Rails.root}' && fig run web bash -c "sleep 10 && rake db:drop db:create db:migrate db:seed"`
  end

  task :build do
    puts `docker build -t 'danelbert/dungeon' '#{Rails.root}'`
  end

end