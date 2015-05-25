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
      return $("<button />")
        .append($("<span />").addClass("glyphicon").addClass(tool.glyph))
        .append($("<span />").text(tool.name))
        .on('click.' + pluginName, tool.handler)
        .onFastTap(pluginName, tool.handler);
    },

    buildZoomWidget: function(tool) {

      var optionFunc = function(val) {
        var txt = Math.round(val) + "%";
        return $("<option />").attr("value", val / 100).text(txt)
      };

      var $select = $("<select />")
        .addClass("form-control input-sm")
        .append(optionFunc(tool.value * 100))
        .change(function() {
          var val = $(this).val();
          tool.handler(val);
        });

      for (var z = 50; z <= 250; z += 50) {
        $select.append(optionFunc(z));
      }

      return $("<div />")
        .append($select);
    },

    isPopupOpen: function($button) {
      if ($button.find(".tool_menu_popup").length) {
        return true;
      } else {
        return false;
      }
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

        var $wrapper = $("<div class='tool_menu_popup_wrapper'></div>")
          .append($popup)
          .appendTo($button);

        _.each(tool.children, function(c) {
          switch (c.type) {
            case "button":
              $popup.append(privateMethods.buildButtonWidget(c));
              break;
            case "zoom":
              $popup.append(privateMethods.buildZoomWidget(c));
              break;
            default:
              throw "Unknown widget type: [" + c.type + "]";
          }
        }, this);

        var popHeight = $wrapper.outerHeight();
        var buttonOffset = $button.offset();
        var buttonVMiddle = buttonOffset.top + ($button.outerHeight() / 2);
        var buttonRight = buttonOffset.left + $button.outerWidth();

        $wrapper.offset({ top: buttonVMiddle - (popHeight / 2), left: buttonRight });
      }
    },

    closePopup: function($button) {
      $button.find(".tool_menu_popup_wrapper").remove();
    },

    handleItemMouseIn: function(evt) {
      var $button = $(this);
      var tool = evt.data.tool;
      if (!privateMethods.isPopupOpen($button)) {
        privateMethods.openPopup($button, tool);

        $button.one("mouseleave." + pluginName, function() {
          privateMethods.closePopup($button);
        });
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