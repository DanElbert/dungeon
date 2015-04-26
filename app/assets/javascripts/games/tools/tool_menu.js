// toolMenu plugin
// plugin for the main floating tool menu
// buttons display currently selected item, hovering
// displays all child buttons (tap for touch devices)

// tools option is expected to be a set of objects that look something like this:
// [
//  {
//    name: "toolName",
//    glyph: "optional glyph (uses first or selected child glyph if null)",
//    tooltip: "optional tooltip (not used if item has children)",
//    handler: function() { return "optional handler; not used if item has children"; },
//    children: [
//      { name: "name", widget: "name of jquery-style plugin to call", options: { data: "set of widget options" }, glyph: "glyph" },
//      { name: "pen", widget: "toolSelector", options: { toolName: "pen", displayName: "Pen" }, glyph: "pen" }
//    ]
//  }
// ]

(function ($) {
  var pluginName = "toolMenu";

  var defaultOptions = {
    selectedTool: null,
    selectedClass: 'selected',
    tools: []
  };

  var methods = {
    initialize: function (opts) {

      var options = $.extend({}, defaultOptions, opts);

      return this.each(function() {
        var $this = $(this);
        privateMethods.rebuild($this, options);
      });
    },

    refresh: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);
        var options = data.options;
        privateMethods.rebuild($this, options);
      });
    }
  };

  var privateMethods = {
    rebuild: function($this, options) {
      var data = $this.data(pluginName);

      // unbind first to ensure there's only ever 1 handler bound
      $this.off('.' + pluginName);
      $this.empty();

      data = data || {};
      data.options = options;
      $this.data(pluginName, data);

      _.each(options.tools, function(tool) {

        var glyph = tool.glyph;
        if (glyph == null) {
          _.each(tool.children, function(c) {
            if (glyph == null || options.selectedTool == c.name) { glyph = c.glyph; }
          }, this);
        }

        var item = $("<button />")
          .append($("<span />").addClass("glyphicon").addClass(glyph))
          //.on('touchstart.' + pluginName, {menu: $this, value: value}, privateMethods.handleItemTouch)
          .on('mouseenter.' + pluginName, {menu: $this, tool: tool}, privateMethods.handleItemMouseIn)
          .appendTo($this);
      }, this);

    },

    handleItemMouseIn: function(evt) {
      var tool = evt.data.tool;
      var $menu = evt.data.menu;
      var $button = $(this);
      if (tool.children && tool.children.length) {
        var $popup = $("<div />")
          .addClass("tool_menu_popup")
          .appendTo($button);

        $button.one("mouseleave." + pluginName, function() {
          $popup.remove();
        });

        _.each(tool.children, function(c) {
          $("<div />")
            .append($("<span />").addClass("glyphicon").addClass(c.glyph))
            .append($("<span />").text(c.name))
            .appendTo($popup);
        }, this);

        var popHeight = $popup.outerHeight();
        var buttonOffset = $button.offset();
        var buttonVMiddle = buttonOffset.top + ($button.outerHeight() / 2);
        var buttonRight = buttonOffset.left + $button.outerWidth();

        $popup.offset({ top: buttonVMiddle - (popHeight / 2), left: buttonRight });
      }
    },

    handleMenuClick: function(evt) {
      var menu = evt.data.menu;
      var data = menu.data(pluginName);
      if (data.isOpen) {
        methods.closeMenu.apply(menu);
      } else {
        methods.openMenu.apply(menu);
      }
    },

    handleMenuTouch: function(evt) {
      var moved = false;

      var simulateClick = function() {
        if (!moved) {
          privateMethods.handleMenuClick(evt)
        }
      };

      var menu = evt.data.menu;

      menu.one('touchend', simulateClick);
      menu.one('touchmove', function() { moved = true; });

      evt.preventDefault();
    },

    handleItemClick: function(evt) {
      var menu = evt.data.menu;
      var selectedKey = evt.data.value;

      privateMethods.setValue(menu, selectedKey);
      methods.closeMenu.apply(menu);
    },

    handleItemTouch: function(evt) {
      var moved = false;

      var simulateClick = function() {
        if (!moved) {
          privateMethods.handleItemClick(evt)
        }
      };

      var menu = evt.data.menu;

      menu.one('touchend', simulateClick);
      menu.one('touchmove', function() { moved = true; });

      evt.preventDefault();
    },

    setValue: function(menu, value) {
      privateMethods.setValueNoCallback(menu, value);

      var data = menu.data(pluginName);
      data.options.selectedCallback(value);
    },

    setValueNoCallback: function(menu, value) {
      var data = menu.data(pluginName);
      data.value = value;

      _.each(data.options.values, function(v, index) {
        data.valueItems[index].removeClass(data.options.selectedClass);
        if (_.isEqual(value, v)) {
          data.valueItems[index].addClass(data.options.selectedClass);
        }
      });

      data.menuButton.empty();
      data.menuButton.append(data.options.contentCallback(value));
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