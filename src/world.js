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
    let prevAnts = ants.length;
    this.ants = this.ants.filter(x => x.health > 0);
    let thisCycleAntsDead = prevAnts - this.ants.length;
    this.antsKilled += thisCycleAntsDead;
    this.budget += thisCycleAntsDead * this.config.budget.antBudgetRate;
    ants.forEach(x => this.matrix.setAnt(x.x, x.y));
  }

  updateWorld() {
    calculateAntDeaths();
    addNewAnts()
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

}
