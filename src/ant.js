import {getDistance, getRandomInt, sameCoord, sameColor} from './utils.js';

export class Ant {

  constructor(x, y, maxX, maxY, tick) {
    // Some things that should be static
    this.contextSize = 3;
    this.jitter = false;
    this.jitterFactor = 3;

    // Things that aren't static
    this.maxX = maxX;
    this.maxY = maxY;
    this.speedPerTick = 1; // TODO: Integrate this into movement.
    this.lastTick = undefined || 0;
    this.health = 100;
    this.x = x;
    this.y = y;
    this.maxDist = getDistance({x: 0, y: 0}, {x: maxX, y: maxY});
    this.tc = Array(this.contextSize).fill([]).map(x => Array(this.contextSize).fill(0));
    this.history = [];
    if (this.speedPerTick !== 1) {
      console.log('Should we do something about tick speed?');
    }
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  chooseNextPath(t) {
    this.biteTarget = undefined;
    var choice = this.smartHeadToTarget();
    if (this.jitter && getRandomInt(0, this.jitterFactor) === 0) {
      // TODO: This code just hacks through walls, it needs to be fixed. Until then jitter=true is a bug
      choice = this.randomWalk();
    }

    /*
    if (sameCoord(choice, this.coord())) {
      // console.log("staying put");
      // Maybe we should bite something if it's nearby.
      this.biteTarget = this.findBitingTargets();
    }
    */

    // Check bounds and make move
    if (choice.x >= 0 && choice.x <= this.maxX && choice.y >= 0 && choice.y <= this.maxY) {
      // Keep the last few moves to prevent jitter. (and for debugging)
      /*
      this.history.push({x: this.x, y: this.y});
      let hl = this.history.length;
      if (hl > 3) {
        this.history = this.history.slice(hl - 3, hl);
      }
      if (hl < 3 || !sameCoord(choice, this.history[1])) { */
        this.x = choice.x;
        this.y = choice.y;
      /*
      } else {
        console.log('Look for a wall to bite?');
        // this.biteTarget = this.findBitingTargets();
      }
      */
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
    /* If we are one block away, no need to jitter. */
    if (getDistance(this.coord(), tgt.coord()) <= 1.3) {
      // Stop moving.
      return this.coord();
    }
    var moveOption = this.coord();
    var minDist = this.maxDist;
    var moveOpt = {x: 0, y: 0};
    /* The code below summarized:
    * Find a place that is closest to the target. */
    var finalChoice = undefined;
    if (this.tc != undefined) {
      let choices = this.tc.map(c => {
        c.distance = getDistance(tgt, c.coord);
        return(c);
      });
      finalChoice = choices.reduce((a,b) => (a.distance < b.distance ? a : b), {distance: this.maxDist})
    }

    if (typeof finalChoice != 'undefined') {
      moveOpt = finalChoice.coord;
    } else {
      moveOpt = this.coord();
    }
    return moveOpt;
  }

  registerTargets(targets) {
    this.targets = targets;
  }

  updateTempContext(data) {
    this.tc = data.map(x => x);
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

  normalizeTempContext(x, y) {
    /* Go from indices in our 3x3 matrix or whatever to a real coordinate */
    return ({
      x: this.x - Math.floor(this.contextSize / 2) + x,
      y: this.y - Math.floor(this.contextSize / 2) + y
    });
  }

  findBitingTargets() {
    var options = [];
    for (var x = 0; x < this.contextSize; x++) {
      for (var y = 0; y < this.contextSize; y++) {
        let col = this.tc[x][y];
        if (col.length === 4 && col[0] === col[1] && col[2] === 0 && col[1] > 0) {
        // if (this.tc[x][y].length === 4 && this.tc[x][y][0] > 0 && this.tc[x][y][0] === this.tc[x][y][1]) {
          // this is an adjacent yellow-shaded point, we should return it
          // console.log('finding a target');
          options.push({
            color: this.tc[x][y],
            target: this.normalizeTempContext(x, y)
          });
        }
      }
    }
    if (options.length > 0) {
      return (options[getRandomInt(0, options.length - 1)]);
    }
    return undefined;
  }
}

