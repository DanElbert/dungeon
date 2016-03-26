(function($) {

  function getDistance(p1, p2) {
    var x_side = Math.pow((p1[0] - p2[0]), 2);
    var y_side = Math.pow((p1[1] - p2[1]), 2);
    return Math.sqrt(x_side + y_side);
  }

  $.fn.onFastTap = function (namespace, handler) {
    if (!handler && _.isFunction(namespace)) {
      handler = namespace;
      namespace = "";
    }

    this.on('touchstart.' + namespace, function(jqEvt) {
      var e = jqEvt.originalEvent;
      if (e.targetTouches && e.targetTouches.length == 1) {
        var moved = false;
        var elem = this;
        var $this = $(this);
        var point = [e.targetTouches[0].pageX, e.targetTouches[0].pageY];

        var simulateClick = function() {
          if (!moved) {
            handler.call(elem, e);
          }
        };

        $this.one('touchend', simulateClick);
        $this.one('touchmove', function(jqEvt) {
          var e = jqEvt.originalEvent;
          if (e.targetTouches.length != 1) {
            moved = true;
          } else {
            var newPoint = [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
            var delta = getDistance(point, newPoint);
            if (delta > 5) {
              moved = true;
            }
          }
        });

        e.preventDefault();
      }
    });

    return this;
  };

})(jQuery);