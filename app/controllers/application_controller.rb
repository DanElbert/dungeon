require 'pathname'

class ApplicationController < ActionController::Base
  protect_from_forgery

  def ensure_valid_user
    if current_user.nil?
      flash[:warning] = "You must login"
      redirect_to login_path
    end
  end

  def ensure_admin_user
    unless current_user && current_user.is_admin?
      flash[:warning] = "You must login as an admin"
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

  # Returns a hash of available board backgrounds.  Each key is a name and its value is the image path.
  def get_board_backgrounds
    bg_path = Rails.root.join("app", "assets", "images", "board", "backgrounds").to_path
    bg_path += "/*"
    Hash[Dir[bg_path].map { |i| [File.basename(i), Pathname.new(i).relative_path_from(Rails.root.join("app", "assets", "images")).to_s]}]
  end
  helper_method :get_board_backgrounds
end
