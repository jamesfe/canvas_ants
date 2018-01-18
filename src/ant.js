class Ant {

  constructor(x, y) {
    // Some things that should be static
    this.contextSize = 3;
    this.jitter = false;
    this.jitterFactor = 3;

    // Things that aren't static
    this.health = 100;
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

    if (sameCoord(choice, this.coord())) {
      console.log("staying put");
      // Maybe we should bite something if it's nearby.
      this.biteTarget = this.findBitingTargets();
    } else {
      this.biteTarget = undefined;
    }

    // Check bounds and make move
    if (choice.x >= 0 && choice.x <= width && choice.y >= 0 && choice.y <= width) {
      this.x = choice.x;
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
    if (getDistance(this.coord(), tgt.coord()) <= 1.5) {
      // Stop moving.
      return this.coord();
    }
    var moveOption = this.coord();
    var minDist = this.maxDist;
    var moveOpt = {x: 0, y: 0};
    for (var x = 0; x < this.contextSize; x++) {
      for (var y = 0; y < this.contextSize; y++) {
        if (sameColor(this.tc[x][y], [0, 0, 0])) {
          moveOption = {
            x: this.x + (x - Math.floor(this.contextSize / 2)),
            y: this.y + (y - Math.floor(this.contextSize / 2))
          };
          // If there is nothing in this square, contemplate moving to it.
          var cDist = getDistance(moveOption, tgt.coord());
          if (cDist < minDist) {
            moveOpt = moveOption;;
            minDist = cDist;
          }
        }
      }
    }
    if (minDist === this.maxDist) {
      moveOpt = this.coord();
    }
    return moveOpt;
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
    /* Given the whole screen of context, set the current ant's tiny context. */
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

  getTempContextFromSmall(smContext) {
    /* From a small piece of context, set the current context. */
    for (var x = 0; x < this.contextSize; x++) {
      for (var y = 0; y < this.contextSize; y++) {
        let start = ((y * this.contextSize) + x) * 4;
        this.tc[x][y] = Array.from(smContext.slice(start, start + 4));
      }
    }
  }

  getContextArguments() {
    /* Get the right x, y, height, and width to give to getImageData for context gathering. */
    return ({
      x: this.x - Math.floor(this.contextSize / 2),
      y: this.y - Math.floor(this.contextSize / 2),
      w: this.contextSize,
      h: this.contextSize
    });
  }

  normalizeTempContext(x, y) {
    /* Go from indices in our 3x3 matrix or whatever to a real coordinate */
    return {
      x: this.x - Math.floor(this.contextSize / 2) + x,
      y: this.y - Math.floor(this.contextSize / 2) + y
    }
  }

  findBitingTargets() {
    for (var x = 0; x < this.contextSize; x++) {
      for (var y = 0; y < this.contextSize; y++) {
        debugger;
        if (this.tc[x][y].length === 4 && this.tc[x][y][0] > 0 && this.tc[x][y][0] === this.tc[x][y][1]) {
          // this is an adjacent yellow-shaded point, we should return it
          console.log('finding a target');
          return ({
            color: this.tc[x][y],
            target: this.normalizeTempContext(x, y)
          });
        }
      }
    }
    return undefined;
  }
}

