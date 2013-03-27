(function() {

  var isOpen = false;
  var isRemovingItem = false;

  $(document).ready(function() {
    var toggle = $("#initiative_toggle");
    var panel = $("#initiative_panel");
    var controls = $("#initiative_controls");
    var nameInput = $("#initiative_name_input");
    var valueInput = $("#initiative_value_input");
    var list = $("#initiative_list");
    var button = $("#initiative_add_button");

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
      var value = valueInput.val();

      if (name) {
        var nameSpan = $("<span />").addClass("name").text(name);
        var valSpan = $("<span />").addClass("value").text(value);
        var li = $("<li />").addClass("ui-state-default").addClass("initiativeItem").append(nameSpan).append(valSpan);
        list.append(li);

        list.sortable("refresh");

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
      }
    });

  });

})();