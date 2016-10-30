class Image < ApplicationRecord

  def self.types
    ['Image', 'CampaignImage', 'CopiedImage', 'BackgroundImage']
  end

  def as_json(opts = {})
    {
        id: self.id,
        name: self.filename,
        url: self.url
    }
  end

  def url
    Rails.application.routes.url_helpers.image_path(id: self.id, format: self.extension)
  end

  def extension
    File.extname(self.filename).sub('.', '')
  end
end
