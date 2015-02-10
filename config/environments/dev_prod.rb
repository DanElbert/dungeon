require 'faye/redis'

Dungeon::Application.configure do

  RELATIVE_ROOT = "/"

  # Settings specified here will take precedence over those in config/application.rb.

  # Add Faye to the middleware stack
  # Note that by referencing the Static middleware, serve_static_assets needs to be left on
  config.middleware.insert_after 'ActionDispatch::Static', 'GameServerMiddleware',
                                 mount: '/game_server',
                                 timeout: 35,
                                 ping: 30,
                                 engine: {
                                     type: Faye::Redis,
                                     uri: "redis://redis:#{ENV['REDIS_PORT_6379_TCP_PORT']}/0/faye"
                                 }

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Use a different cache store in production.
  config.cache_store = :redis_store, "redis://redis:#{ENV['REDIS_PORT_6379_TCP_PORT']}/0/cache_store", { expires_in: 90.minutes }

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  config.assets.debug = true
end
