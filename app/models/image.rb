class Image < ApplicationRecord

  STATUS = {
    unprocessed: 'unprocessed',
    queued: 'queued',
    processing: 'processing',
    processed: 'processed',
    error: 'error'
  }

  def self.types
    ['Image', 'CampaignImage', 'CopiedImage', 'BackgroundImage']
  end

  def as_json(opts = {})
    {
        id: self.id,
        name: self.filename,
        url: self.url,
        is_tiled: self.is_tiled,
        levels: self.levels,
        tile_size: self.tile_size
    }
  end

  def url
    Rails.application.routes.url_helpers.image_path(id: self.id, format: self.is_tiled ? 'json' : self.extension)
  end

  def extension
    File.extname(self.filename).sub('.', '')
  end

  def process!
    self.status = STATUS[:queued]
    self.save!
    ProcessImageJob.perform_later(self.id)
  end

  def self.process_all
    images = Rails.root.join('public', 'images', '*.*')
    `rm -rf #{images}`

    Image.select(:id, :status, :type, :campaign_id, :name).all.each do |i|
      i.process!
    end
  end
end
