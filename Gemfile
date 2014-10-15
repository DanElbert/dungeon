source 'https://rubygems.org'

gem 'rails', '4.1.6'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

gem 'sqlite3'
gem 'mysql2'

gem 'uuid'
gem 'oj'

gem 'thin'
gem 'faye', :require => false
gem 'faye-redis', :require => false
gem 'redis-rails'

gem 'sprockets-rails', :require => 'sprockets/railtie'

gem 'skeleton-rails'

gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'bcrypt-ruby', '~> 3.1.0'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 4.0.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', platforms: :ruby

  gem 'uglifier', '>= 1.0.3'
end

group :deploy do
  gem 'capistrano', '~> 2.15.5'
  gem 'rvm-capistrano'
  gem 'capistrano-deploytags', '~> 0.9.2'
end

group :test do
  gem 'minitest-reporters'
end
