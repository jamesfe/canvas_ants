import {
  buildPermRuins,
  buildWallRuins,
  initialAnts,
  initialGuns,
  initialGlobalTargets,
  buildWallItems,
  buildPermWall } from './initializationHelpers.js';

import {
  getEdgeCoordinate,
  COLORS,
  getMoveOptions,
  getDistance,
  getRelativeDistance } from './utils.js';

import { Ant } from './ant.js';
import { Target } from './target.js';
import { Gun } from './gun.js';


export class World {

  constructor(canvas, config) {
    this.debug = true;
    this.tick = 0;
    this.antsKilled = 0;
    this.budget = config.budget.startingBudget;
    this.config = config;
    this.matrix_height = Math.floor(canvas.height / config.world.factor);
    this.matrix_width = Math.floor(canvas.width / config.world.factor);
    this.matrix = new GlobalMap(this.matrix_height, this.matrix_width);

    this.globalTargets = initialGlobalTargets(this.matrix_height, this.matrix_width, config.world.initialTargets, false);
    this.guns = initialGuns(this.matrix_height, this.matrix_width, config.guns.numGuns, config.guns.gunRange);
    this.bullets = [];
    this.numAntsPerCycle = 1;
    this.permWallItems = []; //buildPermRuins(this.matrix_width, this.matrix_height, []);
    this.wallItems = buildWallItems(this.matrix_width, this.matrix_height, []);

    if (this.debug === true) {
      //this.wallItems = this.buildDebugWall();
      this.wallItems = []; //buildWallItems(this.matrix_width, this.matrix_height, []);
      this.permWallItems = []; //this.buildDebugPermWall();
      this.globalTargets = [new Target(90, 90)];
      this.guns = [new Gun(91, 91, this.matrix_width, this.matrix_height, 7)];
    }

    this.ants = initialAnts(this, 'rand', this.config.world.initialAnts);

    this.maxDist = getDistance({x: 0, y: 0}, {x: this.matrix_width, y: this.matrix_height});
    this.maxRelDist  = getRelativeDistance({x: 0, y: 0}, {x: this.matrix_width, y: this.matrix_height});
    this.deleteTargetCoordItems();
  }

  buildDebugPermWall() {
    var rv = [];
    let xx = 84;
    let yy = 96;
    for (var x = xx; x <= yy; x++) {
      rv.push({x: x, y: yy});
      rv.push({x: x, y: xx});
    }
    for (var y = xx; y <= yy; y++) {
      rv.push({y: y, x: xx});
      rv.push({y: y, x: yy});
    }
    return (rv);
  }

  buildDebugWall() {
    return ([
      {x: 89, y: 91, health: 255},
      {x: 90, y: 91, health: 255},
      {x: 91, y: 91, health: 255},
      {x: 89, y: 90, health: 255},
      {x: 91, y: 90, health: 255},
      {x: 89, y: 89, health: 255},
      {x: 90, y: 89, health: 255},
      {x: 91, y: 89, health: 255}]);
  }

  deleteTargetCoordItems() {
    /* Make sure no items exist which overlap with the targets. */
    // TODO: Check for other things which could interfere (guns)
    this.permWallItems = this.permWallItems.filter(pw => this.globalTargets.filter(tg => pw.x === tg.x && pw.y === tg.y).length === 0);
    this.wallItems= this.wallItems.filter(pw => this.globalTargets.filter(tg => pw.x === tg.x && pw.y === tg.y).length === 0);
  }

  generateNewAnt() {
    /* Generate a new ant from the edge and return it. */
    var c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    while (this.matrix.getCoord(c.x, c.y) !== COLORS.NOTHING) {
      c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    }
    let a = new Ant(c.x, c.y, this);
    a.registerTargets(this.globalTargets); // TODO: refactor
    return (a);
  }

  handleAntMoves(updateTargets) {
    this.ants.forEach(ant => {
      if (updateTargets === true) {
        ant.registerTargets(this.globalTargets); // TODO: Refactor
      }
      let x = ant.x;
      let y = ant.y;
      this.matrix.setNothing(x, y);
      ant.updateTempContext(this.matrix.getTempContext(getMoveOptions(ant.coord())));
      // This next line updates biteTarget
      let hasMoved = ant.chooseNextPath(this.tick);
      if (hasMoved === false) {
        // bite logic differs a tiny bit by target
        let biteTarget = ant.biteTarget;
        if (biteTarget !== undefined) {
          switch (biteTarget.color) {
            case COLORS.WALL:
              let wall = this.wallItems.find(i => i.x == biteTarget.coord.x && i.y == biteTarget.coord.y);
              if (wall !== undefined) {
                wall.health -= 65;
                ant.decHealth(45);
              }
              break;
            case COLORS.TARGET:
              let tgt = this.globalTargets.find(i => i.x == biteTarget.coord.x && i.y == biteTarget.coord.y);
              if (tgt !== undefined) {
                tgt.health -= 5;
                ant.zeroHealth();
              }
              break;
            }
        }
      }
      if (ant.health > 0) {
        this.matrix.setAnt(ant.x, ant.y);
      }
    });

  }

  addNewAnts() {
    if ((this.tick % this.config.world.spawnCycle === 0) && (this.tick % this.config.world.restCycle !== 0) && (this.tick <= 4500)) {
      this.numAntsPerCycle = this.tick;
    } else {
      this.numAntsPerCycle = 0;
    }
    for (var i = 0; i < this.numAntsPerCycle; i++) {
      let a = this.generateNewAnt();
      if (a !== undefined) {
        this.ants.push(a);
      }
    }

  }

  calculateAntDeaths() {
    let prevAnts = this.ants.length;
    this.ants = this.ants.filter(x => x.health > 0);
    let thisCycleAntsDead = prevAnts - this.ants.length;
    this.antsKilled += thisCycleAntsDead;
    this.budget += thisCycleAntsDead * this.config.budget.antBudgetRate;
    this.ants.forEach(x => this.matrix.setAnt(x.x, x.y));
  }

  handleGunsAndBullets() {
    this.guns.forEach(gun => {
      let squaredRange = gun.range * gun.range;
      let closestAnt = this.ants.find(a => getRelativeDistance(a, gun) <= squaredRange);
      var newItem = gun.live(closestAnt);
      if (newItem !== undefined) {
        this.bullets.push(newItem);
      }
    });
    this.bullets.forEach(bullet => {
      let bc = bullet.coord();
      if ((bc !== undefined) && (bullet.dead === false)) {
        let bColor = this.matrix.getCoord(bc.x, bc.y);
        bullet.live(bColor);
        if (bColor === COLORS.ANT) {
          this.ants.filter(a => (a.x === bc.x) && (a.y === bc.y)).forEach(a => a.decHealth(this.config.guns.bulletDamage));
          bullet.dead = true;
        }
      }
      // Make an ant lose health if it hits the ant
    });
    this.bullets = this.bullets.filter(x => x.dead === false);
  }

  initialUpdates() {
    var updateTargets = false;
    let preLength = this.globalTargets.length;
    this.globalTargets = this.globalTargets.filter(x => x.health > 0);
    updateTargets = (preLength !== this.globalTargets.length);
    this.globalTargets.forEach(x => this.matrix.setTarget(x.x, x.y));
    this.permWallItems.forEach(x => this.matrix.setPermWall(x.x, x.y));
    this.wallItems.forEach(w => {
      if (w.health > 0)
        this.matrix.setWall(w.x, w.y)
      else
        this.matrix.setNothing(w.x, w.y)
    });
    this.wallItems = this.wallItems.filter(x => x.health > 0);
    return (updateTargets);
  }

  continueRunning() {
    if (this.tick > this.config.world.runs || this.globalTargets.length === 0) {
       return (false);
    }
    return (true);
  }

  updateWorld() {
    var updateTargets = this.initialUpdates();
    this.calculateAntDeaths();
    this.handleAntMoves(updateTargets);
    this.addNewAnts();
    this.handleGunsAndBullets();

    this.tick += 1;

    return (this.continueRunning());

  }

}


class GlobalMap {
  /* A class that defines a matrix where each pixel is an indicator for an object. */

  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.matrix = new Array(height).fill([]).map(x => Array(width).fill(0));
  }
  setAnt(x, y) {
    this.matrix[x][y] = COLORS.ANT;
  }

  setWall(x, y) {
    this.matrix[x][y] = COLORS.WALL;
  }

  setNothing(x, y) {
    this.matrix[x][y] = COLORS.NOTHING;
  }

  setPermWall(x, y) {
    this.matrix[x][y] = COLORS.PERMWALL;
  }

  setTarget(x, y) {
    this.matrix[x][y] = COLORS.TARGET;
  }

  getCoord(x, y) {
    if ((x < 0) || (y < 0) || (x >= this.width) || (y >= this.height)) {
      return (COLORS.NOTHING);
    }
    return (this.matrix[x][y]);
  }

  getTempContext(inArr) {
  /* Given a list of coordinates from getMoveOptions, check for valid moves.
    * Return a list of the colors and coordinates for each. */
    let validLocs = inArr
      .filter(a => a.x >= 0 && a.x < this.width && a.y >= 0 && a.y < this.height)
      .map(a => { return ({color: this.matrix[a.x][a.y], coord: a}); });
    return (validLocs);
  }
}
