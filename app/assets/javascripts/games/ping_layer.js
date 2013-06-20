function PingLayer() {
  // In seconds
  this.defaultDuration = 7;
  // radius
  this.defaultSize = 35;
  this.defaultPulseCount = 6;

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
    if (animationPoint >= 1) {
      this.finished = true;
    }

    var inverse = 1 - animationPoint;

    drawing.drawCircle(this.point[0], this.point[1], this.maxSize * inverse, 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], this.maxSize * animationPoint, 3, this.color);
  },

  calculateEasing: function() {
    if (this.startTime == null) {
      this.startTime = new Date();
    }
    var durationPercent = (new Date() - this.startTime) / (this.animationDuration * 1000);
    return this.easingFunction(durationPercent);
  },

  // Returns a value between 0 and 1 that represents the current position in the easing,
  // given a p between 0 and 1 representing the percent of duration expired
  easingFunction: function(p) {
    if (p >= 1) return 1;
    if (p <= 0) return 0;

    var pulseRange = 1.0 / this.pulseCount;
    return (p % pulseRange) / pulseRange;
  }
});