// jQuery initiative plugin.  Renders the initiative menu and provides events and methods to manipulate it.

(function ($) {
  var pluginName = "initiative";

  var defaultOptions = {
  };

  var methods = {
    initialize: function(opts) {

      return this.each(function() {
        var options = $.extend({}, defaultOptions, opts);
        var $this = $(this);
        privateMethods.build($this, options);
      });
    },

    // Returns the current initiative data
    serialize: function() {
      if (this.length) {
        privateMethods.serialize(this.first());
      } else {
        return null;
      }
    },

    update: function(data) {
      return this.each(function() {
        privateMethods.update($(this), data);
      });
    },

    // Sets view mode
    enterViewMode: function() {
      return this.each(function() {
        privateMethods.setViewMode($(this), true);
      });
    },

    // Sets edit mode
    leaveViewMode: function() {
      return this.each(function() {
        privateMethods.setViewMode($(this), false);
      });
    },

    // Returns whether the first object in the selector is in view mode
    isViewMode: function() {
      return privateMethods.isViewMode(this.first());
    }
  };

  var privateMethods = {
    build: function($this, options) {

      // ================= Construct the DOM

      var $container = $this
          .addClass("initiative");

      var $editor = $("<div />")
          .addClass("initiative_editor")
          .appendTo($container);

      var $nameInput = $("<input />").attr({type: "text"});
      var $valueInput = $("<input />").attr({type: "number"});
      var $addButton = $("<input />").addClass("btn btn-default btn-xs").attr({type: "button"}).val("Add");

      var $editorTable =
          $("<table />")
              .addClass("table")
              .append(
                $("<thead />")
                  .append(
                    $("<tr />")
                      .append($("<th />").text("Name"))
                      .append($("<th />").text("Initiative").attr({colspan: 2}))
                  )
              )
              .append(
                $("<tr />")
                  .append($("<td />").addClass("name_col").append($nameInput))
                  .append($("<td />").addClass("val_col").append($valueInput))
                  .append($("<td />").addClass("button_col").append($addButton))
          ).appendTo($editor);

      var $ul = $("<ul />")
          .appendTo($container);

      var $buttonContainer = $("<div />")
          .addClass("button_container")
          .appendTo($container);

      var $sortButton = $("<button />")
          .addClass("btn btn-default btn-sm edit_only")
          .text("Sort")
          .appendTo($buttonContainer);

      var $clearButton = $("<button />")
          .addClass("btn btn-default btn-sm edit_only")
          .text("Clear")
          .appendTo($buttonContainer);

      var $viewModeButton = $("<button />")
          .addClass("btn btn-default btn-sm")
          .text("View Mode")
          .appendTo($buttonContainer);


      // ========= Setup Event Handlers

      var $inputs = $nameInput.add($valueInput);

      $addButton.on("click", function() { privateMethods.addEntry($this); });
      $clearButton.on("click", function() { privateMethods.clear($this); });
      $sortButton.on("click", function() { privateMethods.sort($this); });
      $viewModeButton.on("click", function() { privateMethods.toggleViewMode($this); });

      $inputs.on("keypress", function(e) {
        if (e.keyCode == 13) {
          privateMethods.addEntry($this);
          return false;
        }
      });

      var isRemovingItem = false;
      var helperContainer = $("<ul />").css({margin: "0", padding: "0"}).appendTo("body");

      $ul.sortable({
        helper: "clone",
        zIndex: 9000,
        appendTo: helperContainer,
        over: function (event, ui) {
          ui.helper.removeClass("removing");
          isRemovingItem = false;
        },
        out: function (event, ui) {
          if (ui.helper) {
            ui.helper.addClass("removing");
          }
          isRemovingItem = true;
        },
        beforeStop: function (event, ui) {
          if(isRemovingItem) {
            ui.item.remove();
          }
        },
        stop: function(event, ui) {
          privateMethods.processReorder($this);
        }
      });

      //$nameInput.typeahead({
      //},
      //{
      //  name: 'init_names',
      //  source: function(query, sync, async) {
      //    $.getJSON(options.url, {term: query}, function(data) {
      //      async(data);
      //    });
      //  }
      //});

      // ========= Save data
      var data = {
        options: options,
        viewModeButton: $viewModeButton,
        nameInput: $nameInput,
        valueInput: $valueInput,
        list: $ul
      };

      $this.data(pluginName, data);

    },

    addEntry: function($this) {
      var data = $this.data(pluginName);

      var name = data.nameInput.val();
      var val = parseInt(data.valueInput.val());

      if (name) {
        if (isNaN(val)) {
          val = 0;
        }

        var initData = privateMethods.serialize($this);
        initData.push({name: name, value: val});
        privateMethods.update($this, initData);

        privateMethods.triggerChange($this, initData);

        data.nameInput.val("");
        data.valueInput.val("");
        data.nameInput.focus();
      }
    },

    clear: function($this) {
      var data = $this.data(pluginName);
      privateMethods.update($this, []);
      privateMethods.triggerChange($this, []);
    },

    sort: function($this) {
      var data = $this.data(pluginName);
      var initData = privateMethods.serialize($this);

      initData = _.sortBy(initData, function(i) {
        return i.value * -1;
      });

      privateMethods.update($this, initData);
      privateMethods.triggerChange($this, initData);
    },

    serialize: function($this) {
      var data = $this.data(pluginName);
      var initData = [];
      data.list.find("li").each(function(){
        initData.push($(this).data('obj'));
      });

      return initData;
    },

    update: function($this, initiativeData) {
      var data = $this.data(pluginName);

      data.list.empty();

      _.each(initiativeData, function(init) {
        var li = $("<li />").addClass("initiative_item");
        var group = $("<div />").addClass("btn-group")
            .append(
              $("<span />").addClass("name btn btn-primary").text(init.name)
            )
            .append(
              $("<span />").addClass("value btn btn-primary").text(init.value)
            )
            .appendTo(li);
        li.data('obj', init);
        data.list.append(li);
      }, this);
    },

    processReorder: function($this) {
      privateMethods.triggerChange($this, null);
    },

    triggerChange: function($this, initData) {
      var data = $this.data(pluginName);

      if (initData == null) {
        initData = privateMethods.serialize($this);
      }

      $this.trigger('changed', {
        initiative: initData
      });
    },

    toggleViewMode: function($this) {
      privateMethods.setViewMode($this, !privateMethods.isViewMode($this));
    },

    isViewMode: function($this) {
      return $this.hasClass("view_mode");
    },

    setViewMode: function($this, isViewMode) {
      var data = $this.data(pluginName);
      if (isViewMode) {
        data.viewModeButton.text("Edit Mode");
        data.list.sortable("disable");
        $this.addClass("view_mode");
      } else {
        data.viewModeButton.text("View Mode");
        data.list.sortable("enable");
        $this.removeClass("view_mode");
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
