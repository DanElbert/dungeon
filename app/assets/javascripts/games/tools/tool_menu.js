// toolMenu plugin
// plugin for the main floating tool menu
// buttons display currently selected item, hovering
// displays all child buttons (tap for touch devices)

// tools option is expected to be a set of objects that look something like this:
// [
//  {
//    name: "toolName",
//    glyph: "optional glyph (uses first or selected child glyph if null)",
//    selected: false, // boolean that determines visual selected state (determines group glyph when set in children)
//    tooltip: "optional tooltip (not used if item has children)",
//    handler: function() { return "optional handler; not used if item has children"; },
//    children: [
//      { name: "name", selected: false, type: "type of tool", glyph: "glyph", handler: function() { } },
//      { name: "pen", selected: true, type: "button", glyph: "pen", handler: function() { } }
//    ]
//  }
// ]

(function ($) {
  var pluginName = "toolMenu";

  var defaultOptions = {
    selectedClass: 'selected',
    tools: []
  };

  var methods = {
    initialize: function (opts) {

      var options = $.extend({}, defaultOptions, opts);

      return this.each(function() {
        var $this = $(this);
        var data = {options: options};
        $this.data(pluginName, data);
        privateMethods.rebuild($this);
      });
    },

    refresh: function() {
      return this.each(function() {
        var $this = $(this);
        privateMethods.rebuild($this);
      });
    }
  };

  var privateMethods = {
    rebuild: function($this) {
      var data = $this.data(pluginName);
      var options = data.options;

      // unbind first to ensure there's only ever 1 handler bound
      $this.off('.' + pluginName);
      $this.empty();

      _.each(options.tools, function(tool) {

        // Skip any invisible tools
        if (!tool.visible) {
          return;
        }

        var glyph = tool.glyph;

        if (tool.children && tool.children.length) {
          glyph = tool.children[0].glyph;
          _.each(tool.children, function (c) {
            if (c.selected) {
              glyph = c.glyph;
            }
          }, this);
        }

        var item = $("<button />")
          .append($("<span />").addClass("glyphicon").addClass(glyph))
          .appendTo($this);

        if (tool.tooltip) {
          item.attr('title', tool.tooltip);
          item.tooltip({placement: 'right', trigger: 'hover'});
        }

        var evtData = {menu: $this, tool: tool};

        if (tool.children && tool.children.length) {
          item.on('mouseenter.' + pluginName, evtData, privateMethods.handleItemMouseIn);
          item.onFastTap(pluginName, function(e) { privateMethods.handleItemTap.call(this, evtData); });
        } else {
          item.onFastTap(pluginName, function(e) { privateMethods.handleItemClick.call(this, {data: evtData}); });
        }

        item.on('click.'+ pluginName, evtData, privateMethods.handleItemClick);

        if (tool.selected) {
          item.addClass(options.selectedClass);
        }

      }, this);

    },

    buildButtonWidget: function(tool) {
      var button = $("<button />")
        .append($("<span />").addClass(tool.glyph))
        .append($("<span />").text(tool.label || tool.name))
        .on('click.' + pluginName, tool.handler)
        .onFastTap(pluginName, tool.handler);

      if (tool.tooltip) {
        button.attr('title', tool.tooltip);
        button.tooltip({placement: 'right'});
      }

      return button;
    },

    buildZoomWidget: function(tool) {

      var optionFunc = function(val) {
        var txt = Math.round(val) + "%";
        return $("<option />").attr("value", val / 100).text(txt)
      };

      var $select = $("<select />")
        .addClass("form-control input-sm")
        .append(optionFunc(tool.value * 100))
        .mousemove(function(evt) {
          evt.stopPropagation();
        })
        .change(function() {
          var val = $(this).val();
          tool.handler(val);
        });


      _.each([50, 75, 100, 150, 200, 250], function(z) {
        $select.append(optionFunc(z));
      });

      return $("<div />")
        .append($select);
    },

    buildCheckboxWidget: function(tool) {
      var $label = $("<label />")
        .append($("<span />").addClass(tool.glyph))
        .append($("<span />").addClass(tool.value ? "fa fa-check-square-o" : "fa fa-square-o"))
        .append($("<span />").text(tool.label || tool.name))
        .css({"font-weight": "normal"})
        .on('click.' + pluginName, tool.handler)
        .onFastTap(pluginName, tool.handler);

      if (tool.tooltip) {
        $label.attr('title', tool.tooltip);
        $label.tooltip({placement: 'right'});
      }

      return $label;
    },

    isPopupOpen: function($button) {
      return !!$button.data(pluginName + "_popup");
    },

    openPopup: function($button, tool) {
      if (tool.children && tool.children.length) {

        $button.parent().children().each(function() {
          privateMethods.closePopup($(this));
        });

        var $popup = $("<div />")
          .addClass("tool_menu_popup")
          .on("click." + pluginName, function(e) {
            e.stopPropagation();
          });

        var $wrapper = $("<div />")
          .addClass("tool_menu_popup_wrapper")
          .append($popup)
          .appendTo($button.parent());

        var namespace = "." + pluginName + "_popupMouseTracker_" + privateMethods.generateId();

        $button.data(pluginName + "_mouseHandler", namespace);
        $button.data(pluginName + "_popup", $wrapper);

        $("body").on("mousedown" + namespace + " touchstart" + namespace, function(e) {
          if (!$.contains($wrapper[0], e.target)) {
            privateMethods.closePopup($button);
          }
        });

        _.each(tool.children, function(c) {
          if (!c.visible) {
            return;
          }

          var $widget = null;

          switch (c.type) {
            case "button":
              $widget = privateMethods.buildButtonWidget(c);
              break;
            case "zoom":
              $widget = privateMethods.buildZoomWidget(c);
              break;
            case "checkbox":
              $widget = privateMethods.buildCheckboxWidget(c);
              break;
            default:
              throw "Unknown widget type: [" + c.type + "]";
          }

          $widget.addClass("popup_item");
          $popup.append($widget);

        }, this);

        var popHeight = $popup.outerHeight();
        var buttonOffset = $button.offset();
        var buttonVMiddle = buttonOffset.top + ($button.outerHeight() / 2);
        var buttonRight = buttonOffset.left + $button.outerWidth();

        $wrapper.offset({ top: buttonVMiddle - (popHeight / 2), left: buttonRight });
      }
    },

    closePopup: function($button) {
      var $popup = $button.data(pluginName + "_popup");
      var handlerNamespace = $button.data(pluginName + "_mouseHandler");
      if ($popup) {
        $popup.remove();

        if (handlerNamespace) {
          $("body").off(handlerNamespace);
        }

        $button.data(pluginName + "_popup", null);
        $button.data(pluginName + "_mouseHandler", null);
      }
    },

    handleItemMouseIn: function(evt) {
      var $button = $(this);
      var tool = evt.data.tool;
      if (!privateMethods.isPopupOpen($button)) {
        privateMethods.openPopup($button, tool);

        var $popup = $button.data(pluginName + "_popup");

        if ($popup) {
          var namespace = $button.data(pluginName + "_mouseHandler");

          var moveHandler = function(evt) {
            var buttonBox = privateMethods.getElementBox($button);
            var popupBox = privateMethods.getElementBox($popup);
            var point = { x: evt.pageX, y: evt.pageY };

            if (!privateMethods.isInBox(buttonBox, point) && !privateMethods.isInBox(popupBox, point)) {
              privateMethods.closePopup($button);
            }
          };

          $("body").on("mousemove" + namespace, moveHandler);
        }
      }
    },

    handleItemClick: function(evt) {
      var menu = evt.data.menu;
      var tool = evt.data.tool;

      if (tool.children && tool.children.length && !tool.noClickthrough) {
        var selectedTool = _.find(tool.children, function(c) {return c.selected;}) || tool.children[0];
        if (selectedTool) {
          selectedTool.handler();
        }
      } else {
        tool.handler();
      }
    },

    handleItemTap: function(data) {
      var $button = $(this);
      var tool = data.tool;

      if (privateMethods.isPopupOpen($button)) {
        privateMethods.closePopup($button);
      } else {
        privateMethods.openPopup($button, tool);
      }
    },

    // Returns an object with the following properties: top, left, bottom, right
    getElementBox: function($elem) {
      var offset = $elem.offset();
      var height = $elem.outerHeight();
      var width = $elem.outerWidth();

      return {
        top: offset.top,
        left: offset.left,
        bottom: offset.top + height,
        right: offset.left + width
      };
    },

    // Returns true if the given point (object with x and y properties) is inside the given box (object as returned by getElementBox)
    isInBox: function(box, point) {
      return point.x >= box.left && point.x <= box.right &&
              point.y >= box.top && point.y <= box.bottom;
    },

    // Returns a random ID
    generateId: function() {
      return "ID_" + (("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).substr(-4));
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