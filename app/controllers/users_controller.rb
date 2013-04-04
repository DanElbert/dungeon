class UsersController < ApplicationController

  def login

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

  def create_user
    @user = User.new
  end

  def submit_user
    @user = User.new(user_params)

    respond_to do |format|
      if @user.save

        set_current_user(@user)

        format.html { redirect_to lobby_path, notice: 'User was successfully created.' }
        format.json { render json: @user, status: :created, location: @user }
      else
        format.html { render action: "create_user" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  def edit

  end

  def update

  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :password, :password_confirmation)
  end
end