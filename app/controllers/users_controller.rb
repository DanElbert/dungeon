class UsersController < ApplicationController

  before_action :ensure_valid_user, except: [:login, :verify_login, :new, :create, :forgot_password, :submit_forgot_password, :reset_password, :submit_reset_password]

  def login
    if current_user
      flash[:notice] = 'Already logged in'
      return redirect_to root_path
    end
  end

  def logout
    set_current_user(nil)
    session.destroy
    redirect_to login_path
  end

  def verify_login
    if user = User.authenticate(params[:email], params[:password])
      set_current_user(user)
      flash[:notice] = "Welcome, #{user.name}"
      target = lobby_path
      if session[:return_to]
        target = session[:return_to]
        session[:return_to] = nil
      end
      redirect_to target
    else
      flash[:error] = "Invalid credentials"
      render :login
    end
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save

        set_current_user(@user)

        format.html { redirect_to lobby_path, notice: 'User was successfully created.' }
        format.json { render json: @user, status: :created, location: @user }
      else
        format.html { render action: "new" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update(user_params)
      redirect_to lobby_path, notice: 'User account updated'
    else
      render action: 'edit'
    end
  end

  def forgot_password
    @error = false
  end

  def submit_forgot_password
    @user = User.find_by_email(params[:email])
    if @user
      @user.update!(password_reset_token: SecureRandom::uuid)
      UserMailer.with(user: @user).reset_password.deliver_later
    else
      @error = true
      flash[:error] = 'Invalid email'
      render action: :forgot_password
    end
  end

  def reset_password
    @user = User.where(password_reset_token: params[:token]).first
    if @user.nil?
      redirect_to login_path
    end
  end

  def submit_reset_password
    @user = User.where(password_reset_token: params[:token]).first
    @user.password = nil
    if @user.update(user_params)
      redirect_to login_path, notice: 'Password changed'
    else
      render action: 'reset_password'
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :username, :display_name, :ping_color, :password, :password_confirmation)
  end
end