
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
      var toolOptions = _.filter(data.options.toolOptions, function(to) {
        return to.visible !== false;
      });

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
          case "copiedImage":
            $widget = privateMethods.buildImageOption(to);
            break;
          case "boolean" :
            $widget = privateMethods.buildBoolean(to);
            break;
          case "creatureSize":
            $widget = privateMethods.buildCreatureSize(to);
            break;
          case "images":
            $widget = privateMethods.buildImageSelect(to);
            break;
          case "text":
            $widget = privateMethods.buildTextOption(to);
            break;
          case "command":
            $widget = privateMethods.buildCommandOption(to);
            break;
          case "tokenSize":
            $widget = privateMethods.buildTokenSizeOption(to);
            break;
          default:
            $widget = $("<span>" + to.name + "</span>");
        }

        $this.append($widget);
        $widget.attr("title", to.label || to.name);
        $widget.tooltip({trigger: "hover"});

      }, this);
    },

    buildBoolean: function(toolOption) {
      var $widget = $('<div></div>').addClass('option_menu');
      var $check = $("<input />").attr("type", "checkbox")
          .on("change", function() {
            toolOption.value = this.checked;
          })
          .appendTo($widget);

      return $widget;
    },

    buildCreatureSize: function(toolOption) {
      var creatureSizes = [
        {name: "Small", size: "small"},
        {name: "Medium", size: "medium"},
        {name: "Large", size: "large_tall"},
        {name: "Large Long", size: "large_long"},
        {name: "Huge", size: "huge_tall"},
        {name: "Huge Long", size: "huge_long"},
        {name: "Gargantuan", size: "gargantuan_tall"},
        {name: "Gargantuan Long", size: "gargantuan_long"},
        {name: "Colossal", size: "colossal_tall"},
        {name: "Colossal Long", size: "colossal_long"}
      ];

      var $widget = $('<div></div>')
          .addClass('option_menu');

      var $dropdown = $("<select />")
          .appendTo($widget);

      _.each(creatureSizes, function(s) {
        $dropdown.append($("<option />").attr("value", s.size).text(s.name));
      }, this);

      $dropdown
          .change(function() {
            toolOption.value = $(this).val();
            this.blur();
          })
          .mouseleave(function() {
            //this.blur();
          })
          .val(toolOption.value || "medium");

      return $widget;
    },

    buildImageSelect: function(toolOption) {
      var images = [
        {name: '-- Select --', value: ""}
      ];

      var map = new Map();

      _.each(toolOption.images, function(i) { images.push(i); map.set(i.value, i); });

      var $widget = $('<div></div>')
        .addClass('option_menu');

      var $dropdown = $("<select />")
        .appendTo($widget);

      _.each(images, function(s) {
        $dropdown.append($("<option />").attr("value", s.value).text(s.name));
      }, this);

      $dropdown
        .change(function() {
          var v = $(this).val();
          if (v === "") {
            v = null;
          } else {
            v = map.get(v);
          }
          toolOption.value = v;
          this.blur();
        })
        .mouseleave(function() {
          //this.blur();
        });

      return $widget;
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
        {name: "Yellow", color: "#FCE883"},
        {name: "White", color: "#FFFFFF"}
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
            this.blur();
          })
          .mouseleave(function() {
            //this.blur();
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
    },

    buildImageOption: function(toolOption) {
      var $wrapper = $("<div/>");

      if (toolOption.url) {
        $wrapper.addClass("option_menu");
        var $widget = $("<div/>").css("background-image", "url(\"" + toolOption.url + "\")").addClass("img");
        $wrapper.append($widget);
      }

      return $wrapper;
    },

    buildTextOption: function(toolOption) {
      var $widget = $('<div></div>')
        .addClass('option_menu');

      var $input = $("<input />")
        .attr("type", "text")
        .appendTo($widget)
        .val(toolOption.value)
        .on("keyup change blur", function() {
          toolOption.value = $input.val();
        });

      if (toolOption.width == "narrow") {
        $input.css({width: '100px'})
      }

      return $widget;
    },

    buildCommandOption: function(toolOption) {
      var $widget = $("<div/>")
        .addClass('option_menu');

      var $btn = $("<button/>")
        .attr({type: 'button'})
        .addClass('button')
        .text(toolOption.label)
        .click(function() { toolOption.command() })
        .appendTo($widget);

      return $widget;
    },

    buildTokenSizeOption: function(toolOption) {
      var $widget = $("<div/>")
        .addClass('option_menu');

      var $dropdown = privateMethods.buildSimpleDropdown(toolOption, {
        "1x1": "1",
        "2x2": "2",
        "3x3": "3"
      });

      $dropdown.val(toolOption.value || "1");
      $widget.append($dropdown);

      return $widget;
    },

    buildSimpleDropdown: function(toolOption, opts) {
      var optionFunc = function(value, txt) {
        return $("<option />").attr("value", value).text(txt);
      };

      var $dropdown = $("<select />")
        .change(function() {
          toolOption.value = $(this).val();
          this.blur();
        })
        .mouseleave(function() {
          //this.blur();
        });

      _.each(_.pairs(opts), function(pair) {
        $dropdown.append(optionFunc(pair[1], pair[0]));
      }, this);

      return $dropdown;
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