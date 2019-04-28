import {
  getRandomInt,
  COLORS } from './utils.js';

export class Gun {

  constructor(x, y, maxX, maxY) {
    this.x = x;
    this.y = y;
    this.maxX = maxX;
    this.maxY = maxY;
    this.moment = 0;
    this.rate = 2;
    this.angle = getRandomInt(0, 57);
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  live(inputAnt) {
    /* One 'move' for the gun. */
    this.moment += 1;
    if ((this.moment % this.rate === 0) && (inputAnt !== undefined)) {
      // 57 is 180 / pi and rounded
      // let angle = getRandomInt(0, 57);
      let angle = Math.atan2(this.x - inputAnt.x, this.y - inputAnt.y);
      return(new Bullet(this.x, this.y, this.maxX, this.maxY, angle));
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
    this.age = 0;
    this.dead = false;
  }

  coord() {
    if ((this.x <= 0) || (this.y <= 0) || (this.y >= this.maxY - 1) || (this.x >= this.maxX - 1)) {
      this.dead = true;
      return (undefined);
    }
    return {x: Math.round(this.x), y: Math.round(this.y)};
  }

  live(color) {
    /* Given the color of a cell, update yourself. */
    if (color === COLORS.ANT) {
      this.dead = true;
      return (undefined);
    }
    if ((this.x <= 0) || (this.y <= 0) || (this.y >= this.maxY) || (this.x >= this.maxX)) {
      this.dead = true;
      return (undefined);
    }
    this.age++;
    if (this.age > 25) {
      this.dead = true;
    }
    this.x += Math.cos(this.angle);
    this.y += Math.sin(this.angle);
  }
}
