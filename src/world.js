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
  getRelativeDistance } from './utils.js';

import { Ant } from './ant.js';
import { Target } from './target.js';
import { Gun } from './gun.js';


export class World {

  constructor(canvas, config) {
    this.tick = 0;
    this.antsKilled = 0;
    this.budget = config.budget.startingBudget;
    this.config = config;
    this.matrix_height = Math.floor(canvas.height / config.world.factor);
    this.matrix_width = Math.floor(canvas.width / config.world.factor);
    this.matrix = new GlobalMap(this.matrix_height, this.matrix_width);
    this.globalTargets = [new Target(100, 100)]; //initialGlobalTargets(this.matrix_height, this.matrix_width, config.world.initialTargets, false);
    this.ants = initialAnts(this.matrix_height, this.matrix_width, this.globalTargets, 'rand', this.config.world.initialAnts);
    this.guns = []; // initialGuns(this.matrix_height, this.matrix_width, config.guns.numGuns, config.guns.gunRange);
    this.bullets = [];
    this.numAntsPerCycle = 1;
    this.permWallItems = []; // buildPermRuins(this.matrix_width, this.matrix_height, []);
    this.wallItems = []; // buildWallItems(this.matrix_width, this.matrix_height, []);

  }

  generateNewAnt() {
    /* Generate a new ant from the edge and return it. */
    var c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    while (this.matrix.getCoord(c.x, c.y) !== COLORS.NOTHING) {
      c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    }
    let a = new Ant(c.x, c.y, this.matrix_width, this.matrix_height);
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
                console.log('bite ', tgt.health);
                tgt.health -= 5;
                ant.zeroHealth();
              }
              break;
            }
        }
      }
      this.matrix.setAnt(ant.x, ant.y);
    });

  }


  addNewAnts() {
    /*
    if ((this.tick % this.config.world.spawnCycle === 0) && (this.tick % this.config.world.restCycle !== 0) && (this.tick <= 4500)) {
      this.numAntsPerCycle = 1; // this.tick;
    } else {
      this.numAntsPerCycle = 0;
    }
  */
    this.numAntsPerCycle = 1;
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
    let squaredRange = Math.pow(this.config.guns.gunRange, 2);
    this.guns.forEach(gun => {
      let closestAnt = this.ants.find(a => getRelativeDistance(a, gun) <= squaredRange);
      var newItem = gun.live(closestAnt);
      if (newItem !== undefined) {
        this.bullets.push(newItem);
      }
    });
    this.bullets.forEach(bullet => {
      let bc = bullet.coord();
      if (bc !== undefined) {
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
    this.wallItems = this.wallItems.filter(x => x.health > 0);
    this.wallItems.forEach(x => this.matrix.setWall(x.x, x.y));
    return (updateTargets);
  }

  updateWorld() {
    var updateTargets = this.initialUpdates();
    this.calculateAntDeaths();
    this.handleAntMoves(updateTargets);
    this.addNewAnts();
    this.handleGunsAndBullets();
    this.tick += 1;
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
    if ((x === 99) && (y === 99)) {
      console.log('entering');
    }
    this.matrix[x][y] = COLORS.ANT;
  }

  setWall(x, y) {
    this.matrix[x][y] = COLORS.WALL;
  }

  setNothing(x, y) {
  if ((x === 99) && (y === 99)) {
      console.log('clearing');
  }
    this.matrix[x][y] = COLORS.NOTHING;
  }

  setPermWall(x, y) {
    this.matrix[x][y] = COLORS.PERMWALL;
  }

  setTarget(x, y) {
    this.matrix[x][y] = COLORS.TARGET;
  }

  getCoord(x, y) {
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