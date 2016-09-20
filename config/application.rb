require_relative 'boot'
require 'oj'
Oj.mimic_JSON
require 'rails/all'
require 'faye'

require File.expand_path('../../lib/game_server_middleware', __FILE__)

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Dungeon
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
