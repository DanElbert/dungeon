
task :compile do |t|
  Rake::Task['board_detector:build'].invoke
end

desc 'Re-processes all images'
task :update_images => :environment do
  Image.process_all
end

task :fix_line_actions => :environment do |t|
  BoardAction.where(action_type: ['penAction', 'addFogPenAction', 'removeFogPenAction', 'eraseAction']).find_in_batches do |batch|
    BoardAction.transaction do
      batch.each do |a|
        a.properties['lines'].each do |l|
          l['start'] = [l['start'][0].to_i, l['start'][1].to_i]
          l['end'] = [l['end'][0].to_i, l['end'][1].to_i]
        end
        a.save!
      end
    end
  end
end

namespace :debug do
  task :make_debug_image, [:campaign_id, :name] => :environment do |_, args|
    c = Campaign.find(args[:campaign_id])

    # CampaignImage.where(campaign: c, name: args[:name]).destroy_all
    #
    # base_image = Vips::Image::black(5000, 5000)
    # i = CampaignImage.new(campaign: c, name: args[:name], status: Image::STATUS[:unprocessed], filename: "#{args[:name]}.jpg", data: base_image.jpegsave_buffer)
    # i.save!
    # i.process!(true)

    i = CampaignImage.last

    Dir[Rails.root.join('public', 'images', i.id.to_s  , '**/*.jpg').to_s].each do |img|
      if (m = img.match(/(\d+)\/(\d+)_(\d+)\.jpg$/))
        level = m[1]
        x = m[2]
        y = m[3]

        obj = Vips::Image::jpegload(img)
        obj = add_text(obj, "#{level}: (#{x}, #{y})")
        obj.jpegsave(img)
      end
    end

  end

  def add_text(image, str)
    img_img = Vips::Image::text(str, dpi: (image.width / 2).to_i)
    image.draw_mask(255, img_img, 0, 0)
  end

end