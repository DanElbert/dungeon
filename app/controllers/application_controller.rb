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
end
