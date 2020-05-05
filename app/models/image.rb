class Image < ApplicationRecord
  include DefaultValues

  Layer = Struct.new(:number, :scale, :width, :height, :x_tiles, :y_tiles)

  STATUS = {
    unprocessed: 'unprocessed',
    queued: 'queued',
    processing: 'processing',
    processed: 'processed',
    error: 'error'
  }

  OVERLAP = 2
  TILE_SIZE = 256

  belongs_to :campaign, optional: true
  belongs_to :user, optional: true

  scope :without_data, -> { select(:id, :campaign_id, :user_id, :visible, :filename, :type, :name, :is_tiled, :tile_size, :levels, :status, :width, :height, :created_at, :updated_at).readonly }
  scope :active, -> { where(is_deleted: false)}
  scope :for_user, ->(user) { active.where(user: user) }

  validates :data, presence: true, if: -> { has_attribute?(:data) }

  default_values visible: false,
                 is_deleted: false

  def self.types
    ['Image', 'DrawingImage', 'CopiedImage', 'BackgroundImage', 'TokenImage', 'UserTokenImage']
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
      overlap: OVERLAP,
      levels: self.levels,
      level_data: self.level_data.map(&:as_json),
      visible: self.visible
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

  def image_vips
    @imi ||= Vips::Image.new_from_buffer(self.data, "")
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
    if self.data.nil?
      self.width = 0
      self.height = 0
      return
    end
    self.width = image_vips.width
    self.height = image_vips.height
    self.is_tiled = height > 1800 && width > 1800
    if self.is_tiled
      self.tile_size = TILE_SIZE
      self.levels = (Math.log2([height, width].max)).floor
    else
      self.levels = 1
    end

  end

  def process!(now = false)
    self.status = STATUS[:queued]
    self.save!
    if now
      ProcessImageJob.output_image_data(self.id)
    else
      ProcessImageJob.perform_later(self.id)
    end
  end

  def mark_as_processed!
    self.status = Image::STATUS[:processed]
    save!

    if self.campaign_id
      action = BoardAction.build_action_hash('addCampaignImageAction', nil, {image: self.as_json, imageType: self.class.to_s})
      Game.where(campaign_id: self.campaign_id).each do |g|
        GameActionChannel.broadcast_to(g, action)
      end
    end

  end

  def self.process_all
    images = Rails.root.join('public', 'images', '*')
    `rm -rf #{images}`

    Image.select(:id, :status, :type, :campaign_id, :name).all.each do |i|
      i.process!
    end
  end
end
