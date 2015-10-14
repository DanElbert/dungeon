
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

      if (toolOptions.length) {
        $this.show();
      } else {
        $this.hide();
      }

      _.each(toolOptions, function(to) {
        var $widget = null;

        switch (to.type) {
          case "color":
            $widget = privateMethods.buildColorOption(to);
            break;
          case "shapes":
            $widget = privateMethods.buildShapeOption(to);
            break;
          case "size":
            $widget = privateMethods.buildSizeOption(to);
            break;
          default:
            $widget = $("<span>" + to.name + "</span>");
        }

        $this.append($widget);
        $widget.attr("title", to.label || to.name);
        $widget.tooltip({});

      }, this);
    },

    buildColorOption: function(toolOption) {
      var crayolaColors8 = [
        {name: "Black", color: "#000000"},
        {name: "Blue", color: "#1F75FE"},
        {name: "Brown", color: "#B4674D"},
        {name: "Green", color: "#1CAC78"},
        {name: "Orange", color: "#FF7538"},
        {name: "Red", color: "#EE204D"},
        {name: "Purple", color: "#926EAE"},
        {name: "Yellow", color: "#FCE883"}
      ];

      var clear = {name: "Clear", color: null};

      if (toolOption.includeClear) {
        crayolaColors8.unshift(clear);
      }

      var $widget = $('<div></div>').addClass('option_menu');
      var vals = _.map(crayolaColors8, function(c) { return c.color; });

      $widget.toolOptionDropdown({
        values: vals,
        initialValue: toolOption.value || crayolaColors8[0].color,
        contentCallback: function(value) {
          var $content = $("<div></div>").css('width', '100%').css('height', '100%');
          if (value == null) {
            $content.css("background-color", "white");
          } else {
            $content.css("background-color", value);
          }
          return $content;
        },
        selectedCallback: function(value) {
          toolOption.value = value;
        }
      });

      return $widget;
    },

    buildShapeOption: function(toolOption) {
      var $widget = $('<div></div>')
          .addClass('option_menu');

      var optionFunc = function(value, txt) {
        return $("<option />").attr("value", value).text(txt);
      };

      var $dropdown = $("<select />")
          .append(optionFunc("rectangle", "Rectangle"))
          .append(optionFunc("circle", "Circle"))
          .append(optionFunc("line", "Line"))
          .change(function() {
            toolOption.value = $(this).val();
          })
          .val(toolOption.value || "rectangle")
          .appendTo($widget);

      return $widget;
    },

    buildSizeOption: function(toolOption) {
      var $widget = $('<div></div>').addClass('option_menu');

      var maxHeight = 20;
      var minHeight = 3;

      var maxSize = -1;
      var minSize = 99999;
      _.each(toolOption.sizes, function(s) {
        if (s > maxSize) maxSize = s;
        if (s < minSize) minSize = s;
      });

      var heightMap = {};
      _.each(toolOption.sizes, function(s) {
        var dist = (s - minSize) / (maxSize - minSize);
        heightMap[s] = (minHeight + ((maxHeight - minHeight) * dist))>>0;
      });

      $widget.toolOptionDropdown({
        values: toolOption.sizes,
        initialValue: toolOption.value,
        contentCallback: function(value) {
          var wrapper = $("<div></div>").css({width: "100%", height: "100%"});
          var floater = $("<div></div>").css({float: "left", height: "50%", marginBottom: "-" + heightMap[value] / 2 + "px"});
          var line = $("<div></div>").css({clear: "both", height: heightMap[value] + "px", position: "relative", backgroundColor: "black"});
          wrapper.append(floater);
          wrapper.append(line);
          return wrapper;
        },
        selectedCallback: function(value) {
          toolOption.value = value;
        }
      });

      return $widget;
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