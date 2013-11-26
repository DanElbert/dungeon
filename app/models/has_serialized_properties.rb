module HasSerializedProperties
  extend ActiveSupport::Concern

  included do
    serialize :properties
    after_initialize :properties_initializer
  end

  def properties_initializer
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

  module ClassMethods
  end
end