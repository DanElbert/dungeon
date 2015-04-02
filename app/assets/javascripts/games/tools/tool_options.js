function ToolOptions() {
  this.sorted = [];
  this.indexed = {};
}

_.extend(ToolOptions.prototype, {
  add: function(opt) {
    var option = this.addWithoutEvents(opt);
    this.attachHandler(option);
  },

  addWithoutEvents: function(opt) {
    if (!opt.name)
      throw "Options must have names";

    var option = new EventingOption(opt);

    this.indexed[option.name] = option;
    this.sorted.push(option);
    return option;
  },

  get: function(name) {
    return this.indexed[name];
  },

  each: function(iterator, context) {
    _.each(this.sorted, iterator, context);
  },

  clear: function() {
    this.each(function(o) {
      this.removeHandler(o);
    }, this);

    this.sorted = [];
    this.indexed = {};
  },

  // Given a map (such as {property1: 'value', property2: 'value'}),
  // returns an object that responds to the same properties, but also raises
  // events if any of them change
  buildOption: function(map) {
    var opt = new EventingOption(map);
    this.attachHandler(opt);
    return opt;
  },

  attachHandler: function(opt) {
    var self = this;
    $(opt).on('changed.ToolOption', function(e) { self.optionChanged(e, this); });
  },

  removeHandler: function(opt) {
    $(opt).off(".ToolOption");
  },

  optionChanged: function(e, item) {
    var changed = $.Event('changed', {option: item.name, property: e.name, oldValue: e.oldValue, newValue: e.newValue});
    $(this).trigger(changed);
  }
});

function EventingOption(map) {
  this.__values = _.omit(map, _.functions(map).concat(['__values']));

  _.each(_.keys(this.__values), function(key) {
    Object.defineProperty(
        this,
        key,
        {
          enumerable : true,
          get: function() { return this.valueGet(key); },
          set: function(v) { this.valueSet(key, v); }
        }
    );
  }, this);
}

_.extend(EventingOption.prototype, {
  valueGet: function(key) {
    return this.__values[key];
  },

  valueSet: function(key, newValue) {
    var oldValue = this.valueGet(key);
    if (oldValue !== newValue) {
      this.__values[key] = newValue;
      var e = $.Event('changed', {name: key, oldValue: oldValue, newValue: newValue});
      $(this).trigger(e);
    }
  }
});