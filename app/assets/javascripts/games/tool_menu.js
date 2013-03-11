(function ($) {
  var pluginName = "toolMenu";

  var defaultOptions = {
    selectedClass: 'selected',
    values: ["Default"],
    initialValue: "Default",
    contentCallback: function(value) {
      return $("<span></span>").text(value);
    },
    selectedCallback: function(value) {
      alert(value + " selected.");
    }
  };

  var methods = {
    initialize: function (opts) {

      var options = $.extend({}, defaultOptions, opts);

      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);

        // unbind first to ensure there's only ever 1 handler bound
        $this.unbind('.' + pluginName);

        if (!data) {
          data = {};
          data.options = options;
          $this.data(pluginName, data);
        }

        var itemList = $("<div></div>")
            .addClass("menuItemList")
            .hide()
            .appendTo($this);

        _.each(options.values, function(value) {
          $("<div></div>")
              .addClass("menuItemButton")
              .append(data.options.contentCallback(value))
              .on('click.' + pluginName, {menu: $this, value: value}, privateMethods.handleItemClick)
              .appendTo(itemList);
        });

        $("<span></span>").css("clear", "both").appendTo(itemList);

        var menuButton = $("<div></div>")
            .addClass("menuButton")
            .appendTo($this)
            .on('click.' + pluginName, {menu: $this}, privateMethods.handleMenuClick);

        data.itemList = itemList;
        data.menuButton = menuButton;

        privateMethods.setValue($this, options.initialValue);

      });
    },

    value: function(newValue) {

      if (newValue) {
        return this.each(function() {
          var $this = $(this);
          var data = $this.data(pluginName);
          data.value = newValue;
        });
      } else {
        var menu = this.first();
        var data = menu.data(pluginName);
        return data ? data.value : null;
      }
    },

    openMenu: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);
        data.isOpen = true;
        data.itemList.show();
      });
    },

    closeMenu: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);
        data.isOpen = false;
        data.itemList.hide();
      });
    },

    triggerSelection: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data(pluginName);
        privateMethods.setValue($this, data.value);
      });
    }
  };

  var privateMethods = {
    handleMenuClick: function(evt) {
      var menu = evt.data.menu;
      var data = menu.data(pluginName);
      if (data.isOpen) {
        methods.closeMenu.apply(menu);
      } else {
        methods.openMenu.apply(menu);
      }
    },

    handleItemClick: function(evt) {
      var menu = evt.data.menu;
      var selectedKey = evt.data.value;

      privateMethods.setValue(menu, selectedKey);
      methods.closeMenu.apply(menu);
    },

    setValue: function(menu, value) {
      var data = menu.data(pluginName);
      data.value = value;
      data.menuButton.empty();
      data.menuButton.append(data.options.contentCallback(value));
      data.options.selectedCallback(value);
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