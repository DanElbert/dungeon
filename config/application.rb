require_relative 'boot'
require 'rails/all'
require 'oj'
Oj.optimize_rails()


# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Dungeon
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.middleware.insert_after Rack::Sendfile, Rack::Deflater

    config.load_defaults "6.0"
  end
end
