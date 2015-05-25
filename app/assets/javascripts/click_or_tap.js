(function($) {
  $.fn.onFastTap = function (namespace, handler) {
    if (!handler && _.isFunction(namespace)) {
      handler = namespace;
      namespace = "";
    }

    this.on('touchstart.' + namespace, function(e) {
      var moved = false;
      var elem = this;
      var $this = $(this);

      var simulateClick = function() {
        if (!moved) {
          handler.call(elem, e);
        }
      };

      $this.one('touchend', simulateClick);
      $this.one('touchmove', function() { moved = true; });

      e.preventDefault();
    });

    return this;
  };

})(jQuery);