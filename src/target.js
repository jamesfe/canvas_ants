export class Target {
  constructor(x, y) {
    this.health = 255;
    this.x = x;
    this.y = y;
  }

  coord() {
    return {'x': this.x, 'y': this.y};
  }
}

