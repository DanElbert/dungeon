function ToolOptions() {
  this.sorted = [];
  this.indexed = {};
}

_.extend(ToolOptions.prototype, {
  add: function(option) {
    if (!option.name)
      throw "Options must have names";

    option = this.buildOption(option);

    this.indexed[option.name] = option;
    this.sorted.push(option);
  },

  get: function(name) {
    return this.indexed[name];
  },

  each: function(iterator, context) {
    _.each(this.sorted, iterator, context);
  },

  // Given a map (such as {property1: 'value', property2: 'value'}),
  // returns an object that responds to the same properties, but also raises
  // events if any of them change
  buildOption: function(map) {
    var self = this;
    var opt = new EventingOption(map);
    $(opt).on('changed', function(e) { self.optionChanged(e, this); });
    return opt;
  },

  optionChanged: function(e, item) {
    var changed = $.Event('changed', {option: item.name, property: e.name, oldValue: e.oldValue, newValue: e.newValue});
    $(this).trigger(changed);
  }
});

function EventingOption(map) {
  var self = this;
  this.values = map;

  _.each(_.keys(map), function(key) {
    Object.defineProperty(
        self,
        key,
        {
          enumerable : true,
          get: function() { return self.valueGet(key); },
          set: function(v) { self.valueSet(key, v); }
        }
    );
  });
}

_.extend(EventingOption.prototype, {
  valueGet: function(key) {
    return this.values[key];
  },

  valueSet: function(key, newValue) {
    var oldValue = this.valueGet(key);
    if (oldValue !== newValue) {
      this.values[key] = newValue;
      var e = $.Event('changed', {name: key, oldValue: oldValue, newValue: newValue});
      $(this).trigger(e);
    }
  }
});