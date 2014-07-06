class Image < ActiveRecord::Base
  def as_json(opts = {})
    {
        name: self.filename,
        url: Rails.application.routes.url_helpers.image_path(self.id)
    }
  end
end
