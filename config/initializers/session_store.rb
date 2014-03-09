# Be sure to restart your server when you modify this file.

if ['development', 'test'].include? Rails.env
  Dungeon::Application.config.session_store :cookie_store, key: '_dungeon_session'
else
  db = Rails.env == 'production' ? '0' : '1'
  Dungeon::Application.config.session_store :redis_store, redis_server: "redis://rlyeh.thenever:6379/#{db}/session"
end

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rails generate session_migration")
# Dungeon::Application.config.session_store :active_record_store
