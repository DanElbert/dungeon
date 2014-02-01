
task :compile do |t|
  Rake::Task['board_detector:build'].invoke
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