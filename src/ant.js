import {COLORS, getDistance, getRelativeDistance, getRandomInt, sameCoord, sameColor} from './utils.js';

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
    this.maxRelDist = getRelativeDistance({x: 0, y: 0}, {x: maxX, y: maxY});
    this.tc = [];
    this.history = [];
    if (this.speedPerTick !== 1) {
      console.log('Should we do something about tick speed?');
    }
  }

  coord() {
    return {x: this.x, y: this.y};
  }

  chooseNextPath(t) {
    /*
     * Optimization targets:
     * 1. Do not calculate smartHeadToTarget if not necessary
     * 2. Do not calculate biting targets unless it is necessary
     *
     * */
    this.biteTarget = undefined;
    var choice = this.smartHeadToTarget();
    if (this.jitter && getRandomInt(0, this.jitterFactor) === 0) {
      choice = this.randomWalk();
    }

    if (sameCoord(choice, this.coord())) {
      // Staying put? Maybe we should bite something if it's nearby.
      this.biteTarget = this.findBitingTargets();
    }

    // Check bounds and make move
    if (choice.x >= 0 && choice.x <= this.maxX && choice.y >= 0 && choice.y <= this.maxY) {
      this.history.push({x: this.x, y: this.y});
      let hl = this.history.length;
      if (hl > 3) {
        // This is meant to prevent jitter but may cause a bug later.
        this.history = this.history.slice(hl - 3, hl);
      }
      if (hl < 3 || !sameCoord(choice, this.history[1])) {
        this.x = choice.x;
        this.y = choice.y;
        return (true);
      } else {
        this.biteTarget = this.findBitingTargets();
        return (false);
      }
    }
  }

  randomWalk() {
    /* Choose a random place to step into and return it. */
    var finalChoice = undefined;
    if (this.tc != undefined) {
      let choices = this.tc
        .filter(a => a.color === COLORS.NOTHING);
      finalChoice = choices[getRandomInt(0, choices.length - 1)];
    }
    if (finalChoice !== undefined) {
      return (finalChoice.coord);
    }
    return (this.coord());
  }

  smartHeadToTarget() {
    /* Check local context and pick the closest available square to move to the center */
    let tgt = this.closestTarget;
    var moveOpt = this.coord();
    /* If we are one block away, no need to jitter. */
    if (getDistance(this.coord(), tgt.coord()) <= 1.3) {
      return this.coord();
    }
    var finalChoice = undefined;
    let choices = this.tc
      .filter(a => a.color === COLORS.NOTHING)
      .map(c => {
        c.distance = getRelativeDistance(tgt, c.coord);
        return(c);
      });
    finalChoice = choices.reduce(
      (a,b) => (a.distance < b.distance ? a : b),
      {distance: this.maxRelDist});

    if (finalChoice !== undefined) {
      moveOpt = finalChoice.coord;
    }
    return moveOpt;
  }

  registerTargets(targets) {
    this.targets = targets;
    this.setTarget();
  }

  updateTempContext(data) {
    this.tc = data.map(x => x);
  }

  setTarget() {
    // var minDist = this.maxRelDist;
    // var minTarget = undefined;
    this.closestTarget = this.targets
      .map(i => {
        let b = {dist: getRelativeDistance(this.coord(), i.coord()), t: i};
        return b
      })
      .reduce(
        (a, b) => (a.dist < b.dist ? a: b),
        {dist: this.maxRelDist}).t;
    /*
    for (var t in this.targets) {
      var dist = getRelativeDistance(this.coord(), this.targets[t].coord());
      if (dist < minDist) {
        minDist = dist;
        minTarget = this.targets[t];
      }
    }
    */
  }

  normalizeTempContext(x, y) {
    /* Go from indices in our 3x3 matrix or whatever to a real coordinate */
    return ({
      x: this.x - Math.floor(this.contextSize / 2) + x,
      y: this.y - Math.floor(this.contextSize / 2) + y
    });
  }

  findBitingTargets() {
    /* Find a wall that is close by that needs to be bitten. */
    var biteTarget = undefined;
    if (this.tc !== undefined) {
      let validTargets = this.tc
        .filter(a => a.color === COLORS.WALL);
      if (validTargets.length > 0) {
        biteTarget = validTargets[getRandomInt(0, validTargets.length - 1)].coord;
      }
    }
    return (biteTarget);
  }
}

