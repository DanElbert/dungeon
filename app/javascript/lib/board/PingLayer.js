import { Animation, EasingFactory } from "./Animation";
import TWEEN from "@tweenjs/tween.js/dist/tween.esm";
import { hexToRgb } from "../ColorUtil";
import { Vector2 } from "../geometry";

export class PingLayer {
  constructor(board) {
    this.board = board;
    // In seconds
    this.defaultDuration = 7;
    // radius
    this.defaultSize = 500;
    this.defaultPulseCount = 10;

    this.nextPingId = 1;

    this.pings = [];
  }

  add(point, color) {
    this.pings.push(new Ping(point, color, this.nextPingId, this.defaultSize, this.defaultPulseCount, this.defaultDuration));
    //this.board.animations.begin("ping_" + this.nextPingId);
    this.nextPingId = this.nextPingId + 1;
  }

  draw(drawing) {
    const livingPings = [];

    for (let ping of this.pings) {
      if (ping.finished) {
        //this.board.animations.end("ping_" + ping.id);
      } else {
        ping.draw(drawing, this.board);
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

    const ringCount = pulseCount;
    const delay = 0.6;
    const ringDuration = duration - ((ringCount - 1) * delay);

    this.rings = [];

    for (let x = 0; x < ringCount; x++) {
      const ringData = {
        size: 0,
        opacity: 1.0,
        finished: false
      };
      new TWEEN.Tween(ringData)
        .to({size: this.maxSize}, ringDuration * 1000)
        .delay(x * delay * 1000)
        .start();

      new TWEEN.Tween(ringData)
        .to({opacity: 0}, ringDuration * 1000)
        .easing(TWEEN.Easing.Quintic.In)
        .delay(x * delay * 1000)
        .onUpdate(() => {
          const rgbColor = hexToRgb(this.color);
          ringData.alphaColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${ringData.opacity})`;
        })
        .onComplete(() => {
          ringData.finished = true;
        })
        .start();

      this.rings.push(ringData);
    }
  }

  draw(drawing, board) {
    // var animationPoint = this.animation.calculateEasing();
    // this.finished = this.animation.finished;
    //
    // var pingSize = this.maxSize / board.getZoom();
    var zoom = board.getZoom();
    var lineSize = 4 / zoom;
    var xLength = 10 / zoom;
    //
    // //drawing.drawCircle(this.point[0], this.point[1], this.maxSize * (1 - animationPoint), 3, this.color);
    // drawing.drawCircle(this.point[0], this.point[1], (pingSize *0.25) * animationPoint, lineSize, this.color);
    // drawing.drawCircle(this.point[0], this.point[1], pingSize * animationPoint, lineSize, this.color);

    let running = false;

    for (let ring of this.rings) {
      if (!ring.finished) {
        running = true;
        if (ring.size > 0) {
          drawing.drawCircle(this.point[0], this.point[1], ring.size / board.getZoom(), lineSize, ring.alphaColor);
        }
      }
    }

    if (running) {
      let x1 = [
        new Vector2(this.point[0] - xLength, this.point[1] - xLength),
        new Vector2(this.point[0] + xLength, this.point[1] + xLength)
      ];
      let x2 = [
        new Vector2(this.point[0] - xLength, this.point[1] + xLength),
        new Vector2(this.point[0] + xLength, this.point[1] - xLength)
      ];
      drawing.drawPointsLine(this.rings[this.rings.length - 1].alphaColor, lineSize, x1);
      drawing.drawPointsLine(this.rings[this.rings.length - 1].alphaColor, lineSize, x2);
    }

    this.finished = !running;
  }
}

