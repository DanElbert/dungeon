function PingLayer(board) {
  this.board = board;
  // In seconds
  this.defaultDuration = 7;
  // radius
  this.defaultSize = 50;
  this.defaultPulseCount = 5;

  this.nextPingId = 1;

  this.pings = [];
}
_.extend(PingLayer.prototype, {
  add: function(point, color) {
    this.pings.push(new Ping(point, color, this.nextPingId, this.defaultSize, this.defaultPulseCount, this.defaultDuration));
    this.board.animations.begin("ping_" + this.nextPingId);
    this.nextPingId = this.nextPingId + 1;
  },

  draw: function(drawing) {
    var livingPings = [];

    _.each(this.pings, function(ping) {
      ping.draw(drawing, this.board);

      if (ping.finished) {
        this.board.animations.end("ping_" + ping.id);
      } else {
        livingPings.push(ping);
      }

    }, this);

    this.pings = livingPings;
  }
});

function Ping(point, color, id, maxSize, pulseCount, duration) {
  this.id = id;
  this.maxSize = maxSize;
  this.color = color;
  this.point = point;
  this.finished = false;

  this.animation = new Animation(duration, EasingFactory.pulse(pulseCount));
}
_.extend(Ping.prototype, {
  draw: function(drawing, board) {
    var animationPoint = this.animation.calculateEasing();
    this.finished = this.animation.finished;

    var pingSize = this.maxSize / board.getZoom();
    var lineSize = 3 / board.getZoom();

    //drawing.drawCircle(this.point[0], this.point[1], this.maxSize * (1 - animationPoint), 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], (pingSize *0.25) * animationPoint, lineSize, this.color);
    drawing.drawCircle(this.point[0], this.point[1], pingSize * animationPoint, lineSize, this.color);
  }
});