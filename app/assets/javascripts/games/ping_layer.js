function PingLayer() {
  // In seconds
  this.defaultDuration = 7;
  // radius
  this.defaultSize = 50;
  this.defaultPulseCount = 5;

  this.pings = [];
}
_.extend(PingLayer.prototype, {
  add: function(point, color) {
    this.pings.push(new Ping(point, color, this.defaultSize, this.defaultPulseCount, this.defaultDuration));
  },

  draw: function(drawing) {
    var livingPings = [];

    _.each(this.pings, function(ping) {
      ping.draw(drawing);
      if (!ping.finished) {
        livingPings.push(ping);
      }
    }, this);

    this.pings = livingPings;
  }
});

function Ping(point, color, maxSize, pulseCount, duration) {
  this.animationDuration = duration;
  this.pulseCount = pulseCount;
  this.maxSize = maxSize;
  this.color = color;
  this.point = point;
  this.startTime = null;
  this.finished = false;
}
_.extend(Ping.prototype, {
  draw: function(drawing) {
    var animationPoint = this.calculateEasing();

    //drawing.drawCircle(this.point[0], this.point[1], this.maxSize * (1 - animationPoint), 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], (this.maxSize *0.25) * animationPoint, 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], this.maxSize * animationPoint, 3, this.color);
  },

  calculateEasing: function() {
    if (this.startTime == null) {
      this.startTime = new Date();
    }
    var durationPercent = (new Date() - this.startTime) / (this.animationDuration * 1000);
    if (durationPercent >= 1) {
      this.finished = true;
    }
    return this.easingFunction(durationPercent);
  },

  // Returns a value between 0 and 1 that represents the current position in the easing,
  // given a p between 0 and 1 representing the percent of duration expired
  easingFunction: function(p) {
    // The function
    //   f(x) = 0.5 - 0.5cos(x)
    // is a wave with max(y)=1, min(y)=0 and f(0)=0
    // It completes an oscillation in 2pi

    var maxX = this.pulseCount * (2 * Math.PI);
    var x = maxX * p;

    return 0.5 - (0.5 * Math.cos(x));
  }
});