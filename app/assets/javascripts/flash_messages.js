
function flashMessage(flashType, message) {
  $("<div></div>")
      .html(message)
      .addClass(flashType)
      .addClass("flash")
      .hide()
      .appendTo("#flashContainer")
      .show({effect: "pulsate", times: 1, duration: 1500})
      .click(function() { $(this).hide({effect: "fade", duration: 1000}) });
}