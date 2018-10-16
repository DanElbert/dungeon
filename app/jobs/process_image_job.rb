class ProcessImageJob < ApplicationJob
  queue_as :default

  TILE_SIZE = 512

  def perform(id)

    # Put image onto disk
    #
    # create scaled images
    #
    # for each scaled image:
    #   create tiles (512 or 1024?)

    # Object model:
    #  image
    #   level
    #     tile
    #
    # urls:
    #  /images/:id.json
    #  /images/:id/:level/:tile.:format
    #
    #
    # db:
    #  tilesize, levels

    should_process = false

    Image.transaction do
      i = Image.lock.select(:id, :status, :type, :campaign_id, :name).find(id)
      if i.status == 'queued'
        i.status = Image::STATUS[:processing]
        i.save!
        should_process = true
      end
    end

    return unless should_process

    i = Image.find(id)

    begin
      im = Magick::Image.from_blob(i.data).first

      height = im.rows
      width = im.columns

      if height < 1800 || width < 1800
        i.status = Image::STATUS[:processed]
        i.is_tiled = false
        File.binwrite(Rails.root.join('public', 'images', "#{i.id}.#{i.extension}").to_s, i.data)
        i.save!
        return
      end

      root_path = Rails.root.join('public', 'images', i.id.to_s).to_s

      i.levels = (Math.log2([height, width].max) - Math.log2(TILE_SIZE)).floor
      i.is_tiled = true
      i.tile_size = TILE_SIZE

      i.levels.times do |x|
        level_path = root_path + "/#{x + 1}"
        `mkdir -p #{level_path}`
        build_tiles(im, 2 ** x, level_path, i.extension, TILE_SIZE)
      end

      i.status = Image::STATUS[:processed]
      i.save!


    rescue
      i.status = Image::STATUS[:error]
      i.save
      raise
    end


  end

  def build_tiles(image, scale, path, format, tile_size)
    width = image.columns / scale
    height = image.rows / scale
    x_tiles = (width.to_f / tile_size).ceil
    y_tiles = (height.to_f / tile_size).ceil
    scaled_tile = tile_size * scale

    0.upto(x_tiles - 1) do |x|
      0.upto(y_tiles - 1) do |y|
        crop = image.crop(x * scaled_tile, y * scaled_tile, scaled_tile, scaled_tile)
        resized = crop.resize(1.0 / scale)
        resized.write(path + "/#{x}_#{y}.#{format}")
      end
    end
  end

end