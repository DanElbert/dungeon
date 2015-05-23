
(function ($) {
  var pluginName = "toolOptionMenu";

  var defaultOptions = {
    toolOptions: []
  };

  var methods = {
    initialize: function (opts) {

      return this.each(function() {
        var options = $.extend({}, defaultOptions, opts);
        var $this = $(this);
        var data = {options: options};
        $this.data(pluginName, data);
        privateMethods.rebuild($this);
      });
    },

    setOptions: function(toolOptions) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);
        data.options.toolOptions = toolOptions;
        privateMethods.rebuild($this);
      });
    }
  };

  var privateMethods = {
    rebuild: function($this) {
      var data = $this.data(pluginName);
      var toolOptions = data.options.toolOptions;

      $this.empty();

      _.each(toolOptions, function(to) {
        $this.append("<span>" + to.name + "</span>");
      }, this);
    }
  };

  $.fn[pluginName] = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.initialize.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.' + pluginName);
    }
  };

})(jQuery);