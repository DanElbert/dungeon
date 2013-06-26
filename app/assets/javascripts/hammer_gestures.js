Hammer.gestures.Pinch = {
  name: 'pinch',
  index: 40,
  defaults: {
    pinch_min_scale: 0.1
  },
  triggered: false,
  handler: function(ev, inst) {

    switch(ev.eventType) {
      case Hammer.EVENT_START:
        this.triggered = false;
        break;

      case Hammer.EVENT_MOVE:

        // atleast multitouch
        if(ev.touches.length < 2) {
          return;
        }

        var scale_threshold = Math.abs(1-ev.scale);

        // when the distance we moved is too small we skip this gesture
        // or we can be already in dragging
        if(scale_threshold < inst.options.pinch_min_scale) {
          return;
        }

        // we are transforming!
        Hammer.detection.current.name = this.name;

        // first time, trigger dragstart event
        if(!this.triggered) {
          inst.trigger(this.name +'start', ev);
          this.triggered = true;
        }

        inst.trigger(this.name, ev); // basic transform event
        break;

      case Hammer.EVENT_END:
        // trigger dragend
        if(this.triggered) {
          inst.trigger(this.name +'end', ev);
        }

        this.triggered = false;
        break;
    }
  }
};