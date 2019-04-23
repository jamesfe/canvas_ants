import { getRandomInt } from './utils.js';

export class Gun {

  constructor(x, y, maxX, maxY) {
    this.x = x;
    this.y = y;
    this.maxX = maxX;
    this.maxY = maxY;
    this.moment = 0;
    this.rate = 15;
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  live() {
    /* One 'move' for the gun. */
    this.moment += 1;
    if (this.moment % this.rate === 0) {
      // 57 is 180 / pi and rounded
      return(new Bullet(this.x, this.y, this.maxX, this.maxY, getRandomInt(0, 57)));
    }
  }
}


export class Bullet {

  constructor(x, y, maxX, maxY, angle) {
    this.x = x;
    this.y = y;
    this.maxX = maxX;
    this.maxY = maxY;
    this.angle = angle;
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  live() {
    this.x += Math.cos(this.angle);
    this.y += Math.sin(this.angle);
  }
}
