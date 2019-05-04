export class Target {
  constructor(x, y) {
    this.health = 255;
    this.x = Math.floor(x);
    this.y = Math.floor(y);
  }

  coord() {
    return {'x': this.x, 'y': this.y};
  }
}

