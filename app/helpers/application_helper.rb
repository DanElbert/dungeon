module ApplicationHelper
  def if_admin(&block)
    if current_user && current_user.is_admin
      if block
        capture(&block)
      else
        true
      end
    end
  end

  def if_owner(item, &block)
    if current_user && item.respond_to?(:user_id) && (item.user_id == current_user.id)
      if block
        capture(&block)
      else
        true
      end
    end
  end

end
