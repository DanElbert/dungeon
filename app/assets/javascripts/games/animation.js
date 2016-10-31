function Animation(duration, easing, min, max) {
  this.duration = duration;
  this.easing = easing;
  this.startTime = new Date();
  this.finished = false;
  this.min = min == null ? 0 : min;
  this.max = max == null ? 1 : max;
  this.finalValue = null;
}

_.extend(Animation.prototype, {
  calculateEasing: function() {
    if (this.finished) {
      return this.finalValue;
    }

    if (this.duration == 0) {
      this.finalValue = this.max;
      this.finished = true;
      return this.finalValue;
    }

    var durationPercent = Math.min(1, (new Date() - this.startTime) / (this.duration * 1000));
    var easedValue = this.easing(durationPercent);
    var scaledValue = null;

    if (this.max > this.min) {
      scaledValue = (easedValue * (this.max - this.min)) + this.min;
    } else {
      scaledValue = this.min - (easedValue * (this.min - this.max));
    }


    if (durationPercent >= 1) {
      this.finalValue = scaledValue;
      this.finished = true;
    }

    return scaledValue;
  }
});

// Builds functions that return a value between 0 and 1 that represents the current position in the easing,
// given a p between 0 and 1 representing the percent of duration expired
var EasingFactory = {
  pulse: function(times) {
    return function(p) {
      // The function
      //   f(x) = 0.5 - 0.5cos(x)
      // is a wave with max(y)=1, min(y)=0 and f(0)=0
      // It completes an oscillation in 2pi

      var maxX = times * (2 * Math.PI);
      var x = maxX * p;

      return 0.5 - (0.5 * Math.cos(x));
    }
  },

  cubicOut: function() {
    return function(p) {
      p = p - 1;
      return (p * p * p) + 1;
    }
  },

  squareOut: function() {
    return function(p) {
      return (p * (p - 2)) * -1;
    }
  },

  linear: function() {
    return function(p) {
      return p;
    }
  }
};

function AnimationManager() {
  this.maxDuration = 10000;
  this.animations = {};
}

_.extend(AnimationManager.prototype, {
  begin: function(id) {
    this.animations[id] = new Date();
  },

  end: function(id) {
    this.animations = _.omit(this.animations, id);
  },

  isAnimating: function() {
    var cur = new Date();
    this.animations = _.pick(this.animations, function(value, key, obj) {
      return (cur - value) <= this.maxDuration;
    }, this);

    return _.keys(this.animations).length > 0;
  }
});