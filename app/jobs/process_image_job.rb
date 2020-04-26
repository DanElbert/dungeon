class ProcessImageJob < ApplicationJob
  queue_as :default

  def perform(id)
    ProcessImageJob.output_image_data(id)
  end

  def self.output_image_data(id)

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
      i = Image.lock.select(:id, :status, :type, :campaign_id, :user_id, :name).find(id)
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

      images_directory = Rails.root.join('public', 'images')
      FileUtils.mkdir_p images_directory.to_s
      root_path = images_directory.join(i.id.to_s).to_s

      File.binwrite("#{root_path}.#{i.extension}", i.data)

      if !i.is_tiled
        i.status = Image::STATUS[:processed]
        i.save!
        return
      end

      i.image_vips.dzsave(root_path, {
          suffix: ".#{i.extension}",
          overlap: Image::OVERLAP,
          tile_size: Image::TILE_SIZE
      })

      `mkdir -p #{root_path}`

      dzi_dirs = Dir["#{root_path}_files/*"]
      dzi_dirs.sort_by { |d| File.basename(d).to_i }.each_with_index do |dir, idx|
        FileUtils.mv dir, "#{root_path}/#{dzi_dirs.length - idx}"
      end

      `rm -rf #{root_path}.dzi #{root_path}_files`

      File.write("#{root_path}.json", i.to_json)

      # i.level_data.each_with_index do |level, idx|
      #   level_path = root_path + "/#{idx + 1}"
      #   `mkdir -p #{level_path}`
      #   build_tiles(i, level, level_path)
      # end

      i.status = Image::STATUS[:processed]
      i.save!

    rescue
      i.status = Image::STATUS[:error]
      i.save
      raise
    end
  end

  def self.build_tiles(image, level, path)

    scaled_tile = image.tile_size / level.scale

    0.upto(level.y_tiles - 1) do |y|
      0.upto(level.x_tiles - 1) do |x|
        top_margin = y == 0 ? 0 : Image::OVERLAP
        left_margin = x == 0 ? 0 : Image::OVERLAP
        right_margin = x == (level.x_tiles - 1) ? 0 : Image::OVERLAP
        bottom_margin = y == (level.y_tiles - 1) ? 0 : Image::OVERLAP

        tile_width = scaled_tile + left_margin + right_margin
        tile_height = scaled_tile + top_margin + bottom_margin

        tile_x = (x * scaled_tile) - left_margin
        tile_y = (y * scaled_tile) - top_margin

        tile_width = [tile_width, image.width - tile_x].min
        tile_height = [tile_height, image.height - tile_y].min

        # puts "#{top_margin} | #{bottom_margin} (#{tile_x}, #{tile_y}): #{tile_width}x#{tile_height}"

        image.image_vips.
                            extract_area(tile_x, tile_y, tile_width, tile_height).
                            resize(level.scale).
                            write_to_file(path + "/#{x}_#{y}.#{image.extension}")

        # image.image_magick.
        #   crop((x * scaled_tile) - left_margin, (y * scaled_tile) - top_margin, scaled_tile + right_margin + left_margin, scaled_tile + top_margin + bottom_margin).
        #   resize(level.scale).
        #   write(path + "/#{x}_#{y}.#{image.extension}")
      end
    end
    GC.start
  end

end