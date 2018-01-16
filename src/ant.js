class Ant {

  constructor(x, y) {
    // Some things that should be static
    this.contextSize = 3;
    this.jitter = false;
    this.jitterFactor = 3;

    // Things that aren't static
    this.x = x;
    this.y = y;
    this.maxDist = getDistance({x: 0, y: 0}, {x: width, y: height});
    this.tc = Array(this.contextSize).fill([]).map(x => Array(this.contextSize).fill(0));
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  chooseNextPath() {
    var choice = this.smartHeadToTarget();
    if (this.jitter && getRandomInt(0, this.jitterFactor) === 0) {
      choice = this.randomWalk()
    }

    // Check bounds and make move
    if (choice.x >= 0 && choice.x <= width) {
      this.x = choice.x;
    }
    if (choice.y >= 0 && choice.y <= width) {
      this.y = choice.y;
    }
  }

  randomWalk() {
    /* Choose a random place to step into and return it. */
    return {
      x: this.x + getRandomInt(-1, 1),
      y: this.y + getRandomInt(-1, 1)
    };
  }

  smartHeadToTarget() {
    /* Check local context and pick the closest available square to move to the center */
    let tgt = this.findClosestTarget();
    var minDist = this.maxDist;
    var moveOpt = {x: 0, y: 0};
    for (var x = 0; x < this.contextSize; x++) {
      for (var y = 0; y < this.contextSize; y++) {
        if (sameColor(this.tc[x][y], [0, 0, 0])) {
          // If there is nothing in this square, contemplate moving to it.
          var cDist = getDistance(this.coord(), tgt.coord());
          if (cDist < minDist) {
            moveOpt = {x: x, y: y};
            minDist = cDist;
          }
        } else {
          console.log(tc);
        }
      }
    }
    if (minDist == this.maxDist) {
      console.log('no available spaces');
    }
    // Return the new coordinates to which we want to go
    return ({
      x: this.x + moveOpt.x,
      y: this.y + moveOpt.y
    });
  }

  headToTarget() {
    let tgt = this.findClosestTarget();
    var dx = 0;
    var dy = 0;
    if (this.x < tgt.x) { dx = 1; }
    if (this.x > tgt.x) { dx = -1; }
    if (this.y < tgt.y) { dy = 1; }
    if (this.y > tgt.y) { dy = -1; }

    return {
      x: this.x + dx,
      y: this.y + dy
    };
  }

  registerTargets(targets) {
    this.targets = targets;
  }

  findClosestTarget() {
    var minDist = this.maxDist;
    var minTarget = undefined;
    for (var t in this.targets) {
      var dist = getDistance(this.coord(), this.targets[t].coord());
      if (dist < minDist) {
        minDist = dist;
        minTarget = this.targets[t];
      }
    }
    return(minTarget);
  }

  getTempContext(pix) {
    var sX = this.x - Math.floor(this.contextSize / 2);
    var sY = this.y - Math.floor(this.contextSize / 2);
    for (var tY = 0; tY < this.contextSize; tY++) {
      for (var tX = 0; tX < this.contextSize; tX++) {
        if (((sX + tX) >= 0) && ((sY + tY) >= 0)) {
          let start = (((tY + sY) * width) + (tX + sX)) * 4;
          this.tc[tX][tY] = Array.from(pix.slice(start, start + 4));
        } else {
          this.tc[tX][tY] = undefined;
        }
      }
    }
  }
}

