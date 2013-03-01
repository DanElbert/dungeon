class BoardDrawingAction < ActiveRecord::Base

  belongs_to :board
  serialize :properties

  after_initialize :init

  def self.from_message(message)
    action = BoardDrawingAction.new()
    action.uid = message['uid']
    action.action_type = message['actionType']
    action.properties = message.select do |k, _|
      !['uid', 'actionType', 'ext'].include?(k.to_s)
    end

    action
  end

  def actionType
    self.action_type
  end

  def as_json(options={})
    opts = {
        :root => false,
        :only => [:uid],
        :methods => [self.properties.keys, :actionType].flatten
    }

    super(opts)
  end

  def init
    # ActiveRecord uses method_missing to init its own attribute accessors,
    # so wait until after init to enable the property accessors
    self.properties ||= {}
    @enable_properties_methods = true
  end

  def method_missing(sym, *args, &block)
    if @enable_properties_methods && self.properties.key?(sym.to_s)
      return self.properties[sym.to_s]
    end

    super
  end

  def respond_to?(name, include_private = false)
    (@enable_properties_methods && self.properties.key?(name.to_s)) || super
  end

end
