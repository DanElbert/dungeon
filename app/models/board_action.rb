class BoardAction < ActiveRecord::Base
  include HasSerializedProperties

  belongs_to :board

  def self.from_message(message)
    action_model = BoardAction.new
    action_model.uid = message['uid']
    action_model.action_type = message['actionType']
    action_model.properties = message.select do |k, _|
      !['uid', 'actionType', 'ext'].include?(k.to_s)
    end

    action_model
  end

  def as_json(options={})
    opts = {
        :root => false,
        :only => [:uid],
        :methods => [self.properties.keys, :actionType].flatten
    }

    super(opts)
  end

  def actionType
    self.action_type
  end
end