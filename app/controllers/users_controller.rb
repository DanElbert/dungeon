class UsersController < ApplicationController

  before_filter :ensure_valid_user, except: [:login, :verify_login, :new, :create]

  def login

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
      redirect_to lobby_path
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

  private

  def user_params
    params.require(:user).permit(:email, :name, :username, :password, :password_confirmation)
  end
end