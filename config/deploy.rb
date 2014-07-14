default_run_options[:pty] = true
set :application, "dungeon"

# RVM Config
set :rvm_ruby_string, '2.1.0'
set :rvm_type, :system

# Source code
set :scm, :git

# use host github-dungeon to use a special deploy key on azathoth
# Note that for cap to work, you'll have to alias this somehow on the local machine as well
# the following 2 lines in ~/.ssh/config will work:
# Host github-dungeon
#   HostName github.com
set :repository, "git@github-dungeon:DanElbert/dungeon.git"
set :branch, "master"

# Set the stage (required for deploytags; remove if multi-stage is added)
set :stage, 'production'

# Web Server Config
set :deploy_to, "/var/www/#{application}"

role :web, "rlyeh"                          # Your HTTP server, Apache/etc
role :app, "rlyeh"                          # This may be the same as your `Web` server
role :db,  "rlyeh", :primary => true # This is where Rails migrations will run

set :use_sudo, false

set :cache_dirs, %w(public/images)
set :shared_children, fetch(:shared_children) + fetch(:cache_dirs)

require 'rvm/capistrano'
require 'bundler/capistrano'
require 'capistrano-deploytags'

# clean up old releases on each deploy
after "deploy:restart", "deploy:cleanup"

before "deploy:restart", "compile"

task :compile do
  run("RAILS_ENV=#{stage} cd #{deploy_to}/current && bundle exec rake compile")
end

# Generate an additional tasks to control the thin cluster
namespace :deploy do
  desc "Start the Thin processes"
  task :start do
    sudo  <<-CMD
      /etc/init.d/thin start
    CMD
  end

  desc "Stop the Thin processes"
  task :stop do
    sudo <<-CMD
      /etc/init.d/thin stop
    CMD
  end

  desc "Restart the Thin processes"
  task :restart do
    sudo <<-CMD
      /etc/init.d/thin restart
    CMD
  end
end
