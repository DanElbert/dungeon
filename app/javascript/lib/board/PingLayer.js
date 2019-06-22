import { Animation, EasingFactory } from "./Animation";

export class PingLayer {
  constructor(board) {
    this.board = board;
    // In seconds
    this.defaultDuration = 7;
    // radius
    this.defaultSize = 50;
    this.defaultPulseCount = 5;

    this.nextPingId = 1;

    this.pings = [];
  }

  add(point, color) {
    this.pings.push(new Ping(point, color, this.nextPingId, this.defaultSize, this.defaultPulseCount, this.defaultDuration));
    this.board.animations.begin("ping_" + this.nextPingId);
    this.nextPingId = this.nextPingId + 1;
  }

  draw(drawing) {
    const livingPings = [];

    for (let ping of this.pings) {
      ping.draw(drawing, this.board);

      if (ping.finished) {
        this.board.animations.end("ping_" + ping.id);
      } else {
        livingPings.push(ping);
      }
    }

    this.pings = livingPings;
  }
}

class Ping {
  constructor(point, color, id, maxSize, pulseCount, duration) {
    this.id = id;
    this.maxSize = maxSize;
    this.color = color;
    this.point = point;
    this.finished = false;

    this.animation = new Animation(duration, EasingFactory.pulse(pulseCount), 0, 1, 0);
  }

  draw(drawing, board) {
    var animationPoint = this.animation.calculateEasing();
    this.finished = this.animation.finished;

    var pingSize = this.maxSize / board.getZoom();
    var lineSize = 3 / board.getZoom();

    //drawing.drawCircle(this.point[0], this.point[1], this.maxSize * (1 - animationPoint), 3, this.color);
    drawing.drawCircle(this.point[0], this.point[1], (pingSize *0.25) * animationPoint, lineSize, this.color);
    drawing.drawCircle(this.point[0], this.point[1], pingSize * animationPoint, lineSize, this.color);
  }
}

