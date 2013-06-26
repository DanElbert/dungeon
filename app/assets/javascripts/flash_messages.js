
function flashMessage(flashType, message) {

  var timeoutIdContainer = {};

  var $flashDiv = $("<div></div>")
      .html(message)
      .addClass(flashType)
      .addClass("flash")
      .hide()
      .appendTo("#flashContainer")
      .show({effect: "pulsate", times: 1, duration: 1500})
      .bind("click.Flash", function() { $(this).hide({effect: "fade", duration: 1000}); clearTimeout(timeoutIdContainer.id); });

  timeoutIdContainer.id = setTimeout(function() {
    $flashDiv.unbind(".Flash");
    $flashDiv.hide({effect: "fade", duration: 1000});
  }, 10000);
}