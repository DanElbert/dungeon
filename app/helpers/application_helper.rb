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
    if current_user && item.respond_to?(:user_id) && (item.user_id == current_user.id || current_user.is_admin)
      if block
        capture(&block)
      else
        true
      end
    end
  end

  def get_background_image_options(selected)
    get_board_backgrounds.map do |name, path|
      selected = selected == path
      url =  ActionController::Base.helpers.asset_path(path)
      "<option#{selected ? ' selected' : ''} data-img-src='#{url}' value='#{path}'>#{name}</option>"
    end.join("\n").html_safe
  end
end
