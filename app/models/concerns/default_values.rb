# == Default Values
#
# Allows default attributes values to be declared.  The callback used to set the values can be controlled via options.
#
# The following option keys are allowed:
# `:on`.  If omitted, it defaults to :initialize.
# :on may be one of the following: :initialize, :create, :update, :save
#
# `:empty`. If omitted, it defaults to only updating `nil` values
# :empty should be a lambda (or proc) that accepts the current value of the attribute and returns true if the value
# should be replaced by the default
#
# Examples:
#   Sets `attr` to 'default' and `attr2` to 'default' any time the class is instantiated
#     default_values {
#       attr: 'default',
#       attr2: 'default'
#     }
#
#   Sets `roles` to [:super_admin] only when saving a new object and only if roles is an empty array (it will not update a nil value)
#     default_values({roles: [:super_admin]}, {on: :create, empty: ->(v) { v == [] }})
#
module DefaultValues
  extend ActiveSupport::Concern

  DEFAULT_OPTIONS = { on: :initialize }

  DefaultValue = Struct.new(:value, :options)

  included do
    class_attribute :_default_values
    self._default_values = {}

    after_initialize :set_default_values_initialize
    before_create :set_default_values_create
    before_update :set_default_values_update
    before_save :set_default_values_save
  end

  def set_default_values_initialize
    set_default_values(:initialize)
  end

  def set_default_values_create
    set_default_values(:create)
  end

  def set_default_values_update
    set_default_values(:update)
  end

  def set_default_values_save
    set_default_values(:save)
  end

  def set_default_values(on)
    _default_values.each do |k, dv|
      if dv.options[:on].to_sym == on
        v = dv.value
        v_lambda = Proc === v ? v : -> { v }

        tester = dv.options[:empty] || ->(x) { x.nil? }

        self.send("#{k}=", self.instance_exec(&v_lambda)) if self.respond_to?(k) && tester.call(self.send(k))
      end
    end
  end

  module ClassMethods
    # Copy defaults on inheritance.
    def inherited(base)
      base._default_values = _default_values.dup
      super
    end

    def default_values(defaults_hash, options = {})
      options = DEFAULT_OPTIONS.merge(options.symbolize_keys)

      valid_ons = [:initialize, :create, :update, :save]

      unless valid_ons.include? options[:on]
        raise "Invalid options[:on] value: [#{options[:on]}].  Must be one of these symbols: #{valid_ons.join(', ')}"
      end

      if options[:empty].present?
        proc = options[:empty]
        raise "Invalid options[:empty].  Must be a Proc or Lambda with an arity of 1" unless (proc.is_a?(Proc) && proc.arity == 1)
      end

      defaults_hash.each do |k, v|
        _default_values[k] = DefaultValue.new(v, options)
      end
    end
  end
end