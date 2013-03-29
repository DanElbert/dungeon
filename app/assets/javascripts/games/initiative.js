function InitializeInitiativeApi() {

  var isOpen = false;
  var isRemovingItem = false;

  var toggle = $("#initiative_toggle");
  var panel = $("#initiative_panel");
  var controls = $("#initiative_controls");
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
    }
  };

  function triggerChange(newInitiative) {

    if (newInitiative == null) {
      newInitiative = api.serialize();
    }

    $(api).trigger('changed', {
      initiative: newInitiative
    });
  }

  toggle.click(function() {
    if (isOpen) {
      isOpen = false;
      toggle.html("Open");
      controls.hide();
      panel.switchClass("open", "closed", 250);
    } else {
      isOpen = true;
      toggle.html("Close");
      controls.show();
      panel.switchClass("closed", "open", 250);
    }
  });

  $("#initiative_controls input[type='text']").keypress(function(e) {
    if (e.keyCode == 13) {
      $("#initiative_add_button").click();
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

      nameInput.focus();
    }
  });

  list.sortable({
    over: function (event, ui) {
      ui.item.removeClass("removing");
      isRemovingItem = false;
    },
    out: function (event, ui) {
      ui.item.addClass("removing");
      isRemovingItem = true;
    },
    beforeStop: function (event, ui) {
      if(isRemovingItem) {
        ui.item.remove();
      }
    },
    stop: function(event, ui) {
      ui.item.removeClass("removing");
      triggerChange();
    }
  });

  return api;

}