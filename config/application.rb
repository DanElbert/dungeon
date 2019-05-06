require_relative 'boot'
require 'oj'
Oj.mimic_JSON
require 'rails/all'


# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Dungeon
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.middleware.insert_after Rack::Sendfile, Rack::Deflater

    Rails.application.config.active_record.sqlite3.represent_boolean_as_integer = true
  end
end
