import {
  getRandomInt,
  COLORS } from './utils.js';

import config from './config.js';

export class Gun {

  constructor(x, y, maxX, maxY, range) {
    this.x = x;
    this.y = y;
    this.maxX = maxX;
    this.maxY = maxY;
    this.moment = 0;
    this.rate = config.guns.firingRate;
    this.angle = getRandomInt(0, Math.PI * 2);
    if (range === undefined) {
      this.range = config.guns.gunRange;
    }
    this.range = range;
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  live(inputAnt) {
    /* One 'move' for the gun. */
    this.moment += 1;
    if ((this.moment % this.rate === 0) && (inputAnt !== undefined)) {
      // 57 is 180 / pi and rounded
      // let angle = getRandomInt(0, 57);
      let tolerance = Math.PI * 0.05;
      let angle = Math.atan2(inputAnt.y - this.y, inputAnt.x - this.x) + (this.getRandomArbitrary(-1 * tolerance, tolerance));
      return(new Bullet(this.x, this.y, this.maxX, this.maxY, angle, this.range));
    }
  }
}


export class Bullet {

  constructor(x, y, maxX, maxY, angle, range) {
    this.x = x;
    this.y = y;
    this.maxX = maxX + 1; // TODO: the +1 is a symptom of some other bugs, it is tech debt
    this.maxY = maxY + 1;
    this.angle = angle;
    this.age = 0;
    this.dead = false;
    this.range = range;
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
    if ((this.x < 0) || (this.y < 0) || (this.y > this.maxY) || (this.x > this.maxX)) {
      this.dead = true;
      return (undefined);
    }
    this.age++;
    if (this.age > this.range) {
      this.dead = true;
    }
    this.x += Math.cos(this.angle);
    this.y += Math.sin(this.angle);
  }
}
