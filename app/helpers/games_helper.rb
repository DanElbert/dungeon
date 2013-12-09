module GamesHelper
  def get_background_image_options(selected)
    get_board_backgrounds.map do |name, path|
      selected = selected == path
      url =  ActionController::Base.helpers.asset_path(path)
      "<option#{selected ? ' selected' : ''} data-img-src='#{url}' value='#{path}'>#{name}</option>"
    end.join("\n").html_safe
  end
end
