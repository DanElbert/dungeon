class ProcessImageJob < ApplicationJob
  queue_as :default

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
      i.calculate_size!

      File.binwrite(Rails.root.join('public', 'images', "#{i.id}.#{i.extension}").to_s, i.data)

      if !i.is_tiled
        i.status = Image::STATUS[:processed]
        i.save!
        return
      end

      root_path = Rails.root.join('public', 'images', i.id.to_s).to_s

      i.level_data.each_with_index do |level, idx|
        level_path = root_path + "/#{idx + 1}"
        `mkdir -p #{level_path}`
        build_tiles(i, level, level_path)
      end

      i.status = Image::STATUS[:processed]
      i.save!

    rescue
      i.status = Image::STATUS[:error]
      i.save
      raise
    end
  end

  def build_tiles(image, level, path)

    scaled_tile = image.tile_size / level.scale

    0.upto(level.x_tiles - 1) do |x|
      0.upto(level.y_tiles - 1) do |y|
        image.image_magick.
          crop(x * scaled_tile, y * scaled_tile, scaled_tile, scaled_tile).
          resize(level.scale).
          write(path + "/#{x}_#{y}.#{image.extension}")
      end
    end
  end

end