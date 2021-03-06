class BoardAction < ApplicationRecord
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

  def self.build_action_hash(type, uid, properties)
    uid ||= build_uid

    action = {actionType: type, uid: uid}
    properties.each do |k, v|
      action[k] = v
    end

    action
  end

  def self.build_uid
    ('0000' + rand(36**4).to_s(36))[-4..-1]
  end
end