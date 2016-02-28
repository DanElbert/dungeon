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
  this.maxSize = maxSize;
  this.color = color;
  this.point = point;
  this.finished = false;

  this.animation = new Animation(duration, EasingFactory.pulse(pulseCount));
}
_.extend(Ping.prototype, {
  draw: function(drawing) {
    var animationPoint = this.animation.calculateEasing();
    this.finished = this.animation.finished;

    //drawing.drawCircle(this.point[0], this.point[1], this.maxSize * (1 - animationPoint), 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], (this.maxSize *0.25) * animationPoint, 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], this.maxSize * animationPoint, 3, this.color);
  }
});