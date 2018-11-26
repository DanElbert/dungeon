class Initiative < ApplicationRecord
  belongs_to :game, :inverse_of => :initiatives

  def self.from_message(json, index)
    init = Initiative.new
    init.name = json['name']
    init.value = json['value']
    init.sort_order = index
    init
  end

  def as_json(options={})
    opts = {
        :root => false,
        :only => [:id, :name, :value]
    }

    super(opts)
  end

end
