
var flashMessageTypeMap = {
  error: "danger",
  notice: "success"
};

function flashMessage(flashType, message) {

  var timeoutIdContainer = {};

  if (flashMessageTypeMap[flashType]) {
    flashType = flashMessageTypeMap[flashType];
  }

  var closeButton = $("<button type='button' />")
      .addClass("close")
      .append($("<span />").html("&times;"))
      .bind("click.Flash", function() { $(this).parent().hide({effect: "fade", duration: 1000}); clearTimeout(timeoutIdContainer.id); });

  var $flashDiv = $("<div></div>")
      .html(message)
      .append(closeButton)
      .addClass("popup")
      .addClass("alert")
      .addClass("alert-" + flashType)
      .hide()
      .appendTo("#flashContainer")
      .show({effect: "pulsate", times: 1, duration: 1500});

  timeoutIdContainer.id = setTimeout(function() {
    $flashDiv.unbind(".Flash");
    $flashDiv.hide({effect: "fade", duration: 1000});
  }, 5000);
}
