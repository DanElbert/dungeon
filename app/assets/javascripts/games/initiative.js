function InitializeInitiativeApi(name_url) {
  var isRemovingItem = false;

  var nameInput = $("#initiative_name_input");
  var valueInput = $("#initiative_value_input");
  var list = $("#initiative_list");
  var button = $("#initiative_add_button");

  var api = {
    serialize: function() {
      var data = [];
      $("#initiative_list li").each(function(){
        data.push($(this).data('obj'));
      });

      return data;
    },
    update: function(initiativeData) {

      list.empty();

      _.each(initiativeData, function(init) {
        var nameSpan = $("<span />").addClass("name").text(init.name);
        var valSpan = $("<span />").addClass("value").text(init.value);
        var li = $("<li />").addClass("ui-state-default").addClass("initiativeItem").append(nameSpan).append(valSpan);
        li.data('obj', init);
        list.append(li);
      });

      list.sortable("refresh");
    },

    enterViewMode: function() {
      $("#initiative_controls").addClass("view_mode");
      list.sortable("disable");
    },

    leaveViewMode: function() {
      $("#initiative_controls").removeClass("view_mode");
      list.sortable("enable");
    }
  };

  list.on("click", "span.value", function() {
    var $valueSpan = $(this);
    var $input = $("<input type='number' />").addClass("editValue").val($valueSpan.text());
    $valueSpan.parent().append($input);
    $valueSpan.hide();
    list.sortable("disable");
    $input.focus();
  });

  list.on("keypress", "input.editValue", function(e) {
    if (e.keyCode == 13) {
      valChangedHandler($(this));
      return false;
    }
    return true;
  });

  list.on("focusout", "input.editValue", function() {
    var $input = $(this);
    if (parseInt($input.val()) != -999) {
      valChangedHandler($input);
    }
  });

  function valChangedHandler($input) {
    var $li = $input.parent();
    var $valueSpan = $li.children("span.value");
    $li.data('obj').value = parseInt($input.val());
    $input.val(-999);
    $input.remove();
    $valueSpan.show();
    list.sortable("enable");

    triggerChange(api.serialize());
  }

  function triggerChange(newInitiative) {

    if (newInitiative == null) {
      newInitiative = api.serialize();
    }

    $(api).trigger('changed', {
      initiative: newInitiative
    });
  }

  $("#resort_initiative").click(function() {
    var init = api.serialize();
    init = _.sortBy(init, function(i) {
      return i.value * -1;
    });

    triggerChange(init);
  });

  $("#clear_initiative").click(function() {
    triggerChange([]);
  });

  $("#newInitForm input[type='text'], #newInitForm input[type='number']").keypress(function(e) {
    if (e.keyCode == 13) {
      $("#initiative_add_button").click();
      nameInput.focus();
      return false;
    }
  });

  button.click(function() {
    var name = nameInput.val();
    var value = parseInt(valueInput.val());

    if (name) {

      if (isNaN(value)) {
        value = 0;
      }

      var initData = api.serialize();
      initData.push({name: name, value: value});

      triggerChange(initData);

      nameInput.val("");
      valueInput.val("");
    }
  });

  var isAutocompleOpen = false;

  nameInput.autocomplete({
    source: name_url,
    minLength: 0,
    open: function() { isAutocompleOpen = true; },
    close: function() { isAutocompleOpen = false; },
    position: { my: "left top", at: "left bottom", collision: "flip" },
    select: function( event, ui ) {
      valueInput.focus();
    }
  }).on("click", function() {
    if (!isAutocompleOpen) {
      nameInput.autocomplete( "search", "" );
    }
  });

  var $dragTarget = $("<ul></ul>")
      .css({
        margin: "0",
        padding: "0",
        position: "absolute"
      })
      .addClass("ui-widget")
      .appendTo("body");

  list.sortable({
    helper: "clone",
    appendTo: $dragTarget,
    zIndex: 9000,
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
      triggerChange();
    }
  });

  return api;

}