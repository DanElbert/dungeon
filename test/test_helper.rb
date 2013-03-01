ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'
#require "minitest/reporters"

#MiniTest::Reporters.use!

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  #set_fixture_class :board_drawing_data => BoardDrawingData
  fixtures :all

  def set_current_user(user)
    id = user ? user.id : nil
    session[:user_id] = id
  end
end
