# Be sure to restart your server when you modify this file.

if ['development', 'test'].include? Rails.env
  Dungeon::Application.config.session_store :cookie_store, key: '_dungeon_session'
else
  Dungeon::Application.config.session_store :redis_store, redis_server: "redis://redis:#{ENV['REDIS_PORT_6379_TCP_PORT']}/0/session"
end

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rails generate session_migration")
# Dungeon::Application.config.session_store :active_record_store
