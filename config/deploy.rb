default_run_options[:pty] = true
set :application, "dungeon"

# RVM Config
set :rvm_ruby_string, '2.0.0'
set :rvm_type, :system

# Asset Compilation
#set :asset_env, "#{asset_env} RAILS_RELATIVE_URL_ROOT=/spellsheet"

# Source code
set :scm, :git

# use host github-dungeon to use a special deploy key on azathoth
# Note that for cap to work, you'll have to alias this somehow on the local machine as well
# the following 2 lines in ~/.ssh/config will work:
# Host github-dungeon
#   HostName github.com
set :repository, "git@github-dungeon:DanElbert/dungeon.git"
set :branch, "master"

# Web Server Config
set :deploy_to, "/var/www-apps/#{application}"

role :web, "azathoth"                          # Your HTTP server, Apache/etc
role :app, "azathoth"                          # This may be the same as your `Web` server
role :db,  "azathoth", :primary => true # This is where Rails migrations will run

set :use_sudo, false

require "rvm/capistrano"
require "bundler/capistrano"

# if you want to clean up old releases on each deploy uncomment this:
after "deploy:restart", "deploy:cleanup"

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