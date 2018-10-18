class Image < ApplicationRecord

  Layer = Struct.new(:number, :scale, :width, :height, :x_tiles, :y_tiles)

  STATUS = {
    unprocessed: 'unprocessed',
    queued: 'queued',
    processing: 'processing',
    processed: 'processed',
    error: 'error'
  }

  TILE_SIZE = 512

  def self.types
    ['Image', 'CampaignImage', 'CopiedImage', 'BackgroundImage']
  end

  def as_json(opts = {})
    {
      id: self.id,
      name: self.name || self.filename,
      height: self.height,
      width: self.width,
      url: self.url,
      value: self.url(true),
      raw_url: self.url(true),
      extension: self.extension,
      is_tiled: self.is_tiled,
      tile_size: self.tile_size,
      levels: self.levels,
      level_data: self.level_data.map(&:as_json)
    }
  end

  def url(force_image = false)
    Rails.application.routes.url_helpers.image_path(id: self.id, format: (self.is_tiled && !force_image) ? 'json' : self.extension)
  end

  def extension
    File.extname(self.filename).sub('.', '')
  end

  def data=(val)
    @imi = nil
    super
  end

  def image_magick
    @imi ||= Magick::Image.from_blob(self.data).first
  end

  def level_data
    if self.is_tiled && [self.levels, self.width, self.height, self.tile_size].all? { |a| a.present? }
      @level_data ||= self.levels.times.map do |l|
        scale = 2 ** l
        w = self.width / scale
        h = self.height / scale
        Layer.new(l + 1, 1.0 / scale, w, h, (w.to_f / self.tile_size).ceil, (h.to_f / tile_size).ceil)
      end
    else
      []
    end
  end

  def calculate_size!
    @level_data = nil
    self.width = image_magick.columns
    self.height = image_magick.rows
    self.is_tiled = height > 1800 && width > 1800
    if self.is_tiled
      self.tile_size = TILE_SIZE
      self.levels = (Math.log2([height, width].max) - Math.log2(TILE_SIZE)).ceil
    else
      self.levels = 1
    end

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
