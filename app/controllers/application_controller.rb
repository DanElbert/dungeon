require 'pathname'

class ApplicationController < ActionController::Base
  include Pundit
  protect_from_forgery

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Kill all proxy and browser caching of html
  before_action do
    headers['Cache-Control'] = 'no-store, max-age=0'
  end

  def user_not_authorized
    if current_user
      flash[:warning] = 'You are not authorized to perform this action.'
      redirect_to root_path
    else
      redirect_to login_path
    end
  end

  def ensure_valid_user
    if current_user.nil?
      flash[:warning] = "You must login"
      session[:return_to] = request.url
      redirect_to login_path
    end
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
  helper_method :current_user

  def set_current_user(user)
    if user
      session[:user_id] = user.id
    else
      session[:user_id] = nil
    end
  end

  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end

end
