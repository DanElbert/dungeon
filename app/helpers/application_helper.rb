module ApplicationHelper
  def if_admin(&block)
    if current_user && current_user.is_admin
      capture(&block)
    end
  end
end
