class UserMailer < ApplicationMailer

  def reset_password
    @user = params[:user]
    @reset_url = reset_password_user_url(token: @user.password_reset_token)
    mail(to: @user.email, subject: 'Dungeon Password Reset')
  end

end
