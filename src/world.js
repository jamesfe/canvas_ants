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
  getRelativeDistance,
  newMat } from './utils.js';



export class World {

  constructor(canvas, config) {
    this.tick = 0;
    this.antsKilled = 0;
    this.budget = config.budget.startingBudget;
    this.config = config;
    this.matrix_height = Math.floor(canvas.height / config.world.factor);
    this.matrix_width = Math.floor(canvas.width / config.world.factor);
    this.matrix = new GlobalMap(this.matrix_height, this.matrix_width);
    this.globalTargets = initialGlobalTargets(this.matrix_height, this.matrix_width, config.world.initialTargets, false);
    this.ants = initialAnts(this.matrix_height, this.matrix_width, this.globalTargets, 'rand', this.config.world.initialAnts);
    this.guns = initialGuns(this.matrix_height, this.matrix_width, config.guns.numGuns, config.guns.gunRange);
    this.bullets = [];
    this.numAntsPerCycle = 1;
    this.permWallItems = buildPermRuins(this.matrix_width, this.matrix_height, []);
    this.wallItems = []; // buildWallItems(this.matrix_width, this.matrix_height, []);

  }

  generateNewAnt() {
    /* Generate a new ant from the edge and return it. */
    var c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    while (this.matrix.getcoord(c.x, c.y) !== COLORS.NOTHING) {
      c = getEdgeCoordinate(this.matrix_height, this.matrix_width);
    }
    let a = new Ant(c.x, c.y, this.matrix_width, this.matrix_height);
    a.registerTargets(this.globalTargets); // TODO: refactor
    return (a);
  }

  handleAntMoves() {
    this.ants.forEach(ant => {
      /* We remove the ant from the global map */
      // if (updateTargets === true) {
        ant.registerTargets(this.globalTargets); // TODO: Refactor
      //}
      let x = ant.x;
      let y = ant.y;
      this.matrix.setNothing(x, y);
      ant.updateTempContext(getTempContext(getMoveOptions(ant.coord()), this.matrix_height, this.matrix_width, globalMap));
      // This next line updates biteTarget
      let hasMoved = ant.chooseNextPath(tick);

      if (hasMoved === false) {
        // bite logic differs a tiny bit by target
        let biteTarget = ant.biteTarget;
        if (biteTarget !== undefined) {
          switch (biteTarget.color) {
          case COLORS.WALL:
            let wall = wallItems.find(i => i.x == biteTarget.coord.x && i.y == biteTarget.coord.y);
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
      globalMap[ant.x][ant.y] = COLORS.ANT;
    });

  }


  addNewAnts() {
    if ((this.tick % this.config.world.spawnCycle === 0) && (this.tick % this.config.world.restCycle !== 0) && (tick <= 4500)) {
      this.numAntsPerCycle = tick;
    } else {
      this.numAntsPerCycle = 0;
    }

    for (var i = 0; i < this.numAntsPerCycle; i++) {
      let a = generateNewAnt();
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
    let squaredRange = Math.pow(config.guns.gunRange, 2);
    guns.forEach(gun => {
      let closestAnt = ants.find(a => getRelativeDistance(a, gun) <= squaredRange);
      var newItem = gun.live(closestAnt);
      if (newItem !== undefined) {
        bullets.push(newItem);
      }
    });
    bullets.forEach(bullet => {
      let bc = bullet.coord();
      if (bc !== undefined) {
        let bColor = globalMap[bc.x][bc.y];
        bullet.live(bColor);
        if (bColor === COLORS.ANT) {
          ants.filter(a => (a.x === bc.x) && (a.y === bc.y)).forEach(a => a.decHealth(config.guns.bulletDamage));
          bullet.dead = true;
        }
      }
      // Make an ant lose health if it hits the ant
    });
    bullets = bullets.filter(x => x.dead === false);
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
  }

  updateWorld() {
    console.log('hi');
    this.initialUpdates();
    this.calculateAntDeaths();
    this.handleAntMoves();
    this.addNewAnts();
    this.handleGunsAndBullets();
  }

}


class GlobalMap {
  /* A class that defines a matrix where each pixel is an indicator for an object. */

  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.matrix = newMat(height, width);
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
    return (this.matrix[x][y]);
  }

}
