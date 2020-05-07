class Initiative < ApplicationRecord
  belongs_to :campaign, :inverse_of => :initiatives

  def self.from_message(json, index)
    init = Initiative.new
    init.name = json['name']
    init.value = json['value']
    init.bonus = json['bonus']
    init.source = json['source']
    init.sort_order = index
    init
  end

  def as_json(options={})
    opts = {
        :root => false,
        :only => [:id, :name, :value, :bonus, :source]
    }

    super(opts)
  end

end
