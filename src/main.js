import {
  getEdgeCoordinate,
  COLORS,
  getMoveOptions,
  getRelativeDistance,
  newMat } from './utils.js';

import {
  buildPermRuins,
  buildWallRuins,
  initialAnts,
  initialGuns,
  initialGlobalTargets,
  buildWallItems,
  buildPermWall } from './initializationHelpers.js';

import config from './config.js';

import { Ant } from './ant.js';
import { Gun } from './gun.js';

let targetColor = [0, 0, 255];
let gunColor = [255, 255, 255];
let bulletColor = gunColor;
let backgroundColor = [0, 0, 0];

let numAntsPerCycle = 1;
var started = false;
var globalDrawCancellation = undefined;
var tick = 0;
var antsKilled = 0;
var budget = config.budget.startingBudget;
var clickAction = 'nothing';
var numAnts = 1;
var canvas = document.getElementById('canvas');
canvas.height = config.world.height;
canvas.width = config.world.width;

var gHeight = Math.floor(canvas.height / config.world.factor);
var gWidth = Math.floor(canvas.width / config.world.factor);

var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function getTempContext(inArr, h, w, matrix) {
  /* Given a matrix from getMoveOptions, check the matrix for valid moves.
    * Return a list of the colors and coordinates for each. */
  let validLocs = inArr
    .filter(a => a.x >= 0 && a.x < w && a.y >= 0 && a.y < h)
    .map(a => { return ({color: matrix[a.x][a.y], coord: a}); });
  // We cannot move into walls or other ants, for now we say we can only move into "nothing"
  return (validLocs);
}

function putSizedPixel(coord, col, s) {
  /* Put a pixel with size s on the world map.*/
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(coord.x * s, coord.y * s, s, s);
}

function putSingleSizedPixel(coord, col, s, size) {
  /* Put a pixel with size s on the world map.*/
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(coord.x * s, coord.y * s, size, size);
}

function clearScreen(col) {
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* Initialize all the various items on the map */
var globalTargets = initialGlobalTargets(gHeight, gWidth, config.world.initialTargets, false);
var ants = initialAnts(gHeight, gWidth, globalTargets, 'rand', numAnts);
var guns = initialGuns(gHeight, gWidth, config.guns.numGuns, config.guns.gunRange);
var bullets = [];
// var permWallItems = buildPermWall(gWidth, gHeight, []);
var permWallItems = buildPermRuins(gWidth, gHeight, []);
var wallItems = []; // buildWallItems(gWidth, gHeight, []);

var updates = [];
var draws = [];

/* DOM elements */
let domTickDisplay = document.getElementById('tickDisplay');
let domAntsKilled = document.getElementById('antsKilledDisplay');
let domBudgetDisplay = document.getElementById('budgetDisplay');

function updateWorld() {
  /* Deal with the business logic of the game. */

  function generateNewAnt() {
    /* Generate a new ant from the edge and return it. */
    var c = getEdgeCoordinate(gHeight, gWidth);
    while (globalMap[c.x][c.y] !== COLORS.NOTHING) {
      c = getEdgeCoordinate(gHeight, gWidth);
    }
    let a = new Ant(c.x, c.y, gWidth, gHeight);
    a.registerTargets(globalTargets);
    return (a);
  }

  let subt0 = performance.now();
  var globalMap = newMat(gHeight, gWidth);
  // Register on global map
  var updateTargets = false;
  let preLength = globalTargets.length;
  globalTargets = globalTargets.filter(x => x.health > 0);
  updateTargets = (preLength !== globalTargets.length);
  globalTargets.forEach(x => globalMap[x.x][x.y] = COLORS.TARGET);
  permWallItems.forEach(x => globalMap[x.x][x.y] = COLORS.PERMWALL);
  wallItems = wallItems.filter(x => x.health > 0);
  wallItems.forEach(x => globalMap[x.x][x.y] = COLORS.WALL);
  let prevAnts = ants.length;
  ants = ants.filter(x => x.health > 0);
  let thisCycleAntsDead = prevAnts - ants.length;
  antsKilled += thisCycleAntsDead;
  budget += thisCycleAntsDead * config.budget.antBudgetRate;
  ants.forEach(x => globalMap[x.x][x.y] = COLORS.ANT);

  // Now make some moves
  ants.forEach(ant => {
    /* We remove the ant from the global map */
    if (updateTargets === true) {
      ant.registerTargets(globalTargets);
    }
    let x = ant.x;
    let y = ant.y;
    globalMap[x][y] = COLORS.NOTHING;
    ant.updateTempContext(getTempContext(getMoveOptions(ant.coord()), gHeight, gWidth, globalMap));
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
          let tgt = globalTargets.find(i => i.x == biteTarget.coord.x && i.y == biteTarget.coord.y);
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

  // numAntsPerCycle = Math.floor(tick / 100);

  domUpdate();
  if ((tick % config.world.spawnCycle === 0) && (tick % config.world.restCycle !== 0) && (tick <= 4500)) {
    numAntsPerCycle = tick;
  } else {
    numAntsPerCycle = 0;
  }

  for (var i = 0; i < numAntsPerCycle; i++) {
    let a = generateNewAnt();
    if (a !== undefined) {
      ants.push(a);
    }
  }

  let subt1 = performance.now();
  updates.push(subt1-subt0);
  drawWorld();
  if (tick > config.world.runs || globalTargets.length === 0) {
    if (tick > config.world.runs) {
      console.log('Congratulations, time ran out!');
    } else {
      console.log('You were unable to protect all the targets.');
    }
    clearInterval(globalDrawCancellation);
    showPerformance();
  } else {
    tick += 1;
  }
}

function drawWorld() {
  let subt0 = performance.now();
  clearScreen(backgroundColor);
  ants.forEach(x => putSizedPixel(x.coord(), x.antColor(), config.world.factor));
  wallItems.forEach(x => putSizedPixel(x, [x.health, x.health, 0], config.world.factor));
  permWallItems.forEach(x => putSizedPixel(x, [255, 0, 0], config.world.factor));
  globalTargets.forEach(x => putSizedPixel(x.coord(), targetColor, config.world.factor));
  guns.forEach(x => putSizedPixel(x.coord(), gunColor, config.world.factor));
  bullets.forEach(x => {
    let crd = x.coord();
    if (crd !== undefined) {
      putSingleSizedPixel(x.coord(), bulletColor, config.world.factor, 2);
    }
  });
  let subt1 = performance.now();
  draws.push(subt1-subt0);
}

function showPerformance() {
  let avgUpdate = updates.reduce((a, b) => a + b, 0) / updates.length;
  console.log('Average update: ', avgUpdate, ' first: ', updates[0], ' last: ', updates[updates.length - 1]);

  let avgDraw = draws.reduce((a, b) => a + b, 0) / draws.length;
  console.log('Average draws: ', avgDraw, ' first: ', draws[0], ' last: ', draws[draws.length - 1]);
}

function buttonPriceUpdate() {
  document.getElementById('addWall').innerHTML = 'Add Wall (' + config.prices.wall.toString() + ')';
  document.getElementById('addGun').innerHTML = 'Add Gun (' + config.prices.gun.toString() + ')';
  document.getElementById('addPermWall').innerHTML = 'Add Permanent Wall (' + config.prices.permWall.toString() + ')';
}

function domUpdate() {
  /* DOM Updates: Show scores, tick counter, etc. */
  domTickDisplay.innerHTML = tick;
  domAntsKilled.innerHTML = antsKilled;
  domBudgetDisplay.innerHTML = budget.toFixed(1);

}

function startMovement(cancellation) {
  if (started === false) {
    started = true;
    if (cancellation !== undefined) {
      clearTimeout(cancellation);
    }
    globalDrawCancellation = setInterval(updateWorld, config.world.timePerRun);
  }
}

function addWall() {
  clickAction = 'add_wall';
}

function addGun() {
  clickAction = 'add_gun';
}

function addPermWall() {
  clickAction = 'add_perm_wall';
}

function newWall(x, y, mX, mY) {
  if (x < mX && y < mY && x > 0 && y > 0 && wallItems.find(i => i.x === x && i.y === y) === undefined) {
    wallItems.push({x: x, y: y, health: 255});
  }
}


// TODO move this max diagonal distance elsewhere (precompute somewhereE)
let maxRelDist = getRelativeDistance({x: 0, y: 0}, {x: gWidth, y: gHeight})
function distanceToClosestTarget(x, y, maxDist) {
  return globalTargets
      .map(i => {
        let b = {dist: getRelativeDistance({x: x, y: y}, i.coord()), t: i};
        return b;
      })
      .reduce(
        (a, b) => (a.dist < b.dist ? a: b),
        {dist: maxRelDist}).t;
}


function canvasClickHandler(event) {
  let x = Math.round(event.layerX / config.world.factor) - 1;
  let y = Math.round(event.layerY / config.world.factor) - 1;
  if ((clickAction === 'add_wall') && (budget >= config.prices.wall)) {
    let p = getMoveOptions({x: x, y: y});
    p.forEach(i => newWall(i.x, i.y, gWidth, gHeight));
    budget -= config.prices.wall;
  }
  else if ((clickAction === 'add_gun') && (budget >= config.prices.gun)){

    if (guns.find(b => (b.x === x && b.y === y)) === undefined) {
      guns.push(new Gun(x, y, gWidth, gHeight, config.guns.gunRange));
      budget -= config.prices.gun;
    }
  }
  else if ((clickAction === 'add_perm_wall') && (budget >= config.prices.permWall)) {
    if (permWallItems.find(b => (b.x === x && b.y === y)) === undefined) {
      permWallItems.push({x: x, y: y});
      budget -= config.prices.permWall;
    }
    let pp = distanceToClosestTarget(x, y, maxRelDist);
    // TODO: just get the distance, not the target
    console.log(pp);
  }
  domUpdate();
}

function stopMovement() {
  clearInterval(globalDrawCancellation);
}

let drawInterval = setInterval(drawWorld, config.world.timePerRun);

document.getElementById('addWall').addEventListener('mouseup', addWall);
document.getElementById('addGun').addEventListener('mouseup', addGun);
document.getElementById('addPermWall').addEventListener('mouseup', addPermWall);
document.getElementById('canvas').addEventListener('mouseup', canvasClickHandler);
document.getElementById('start').addEventListener('mouseup', startMovement, drawInterval);
document.getElementById('stop').addEventListener('mouseup', stopMovement);

// startMovement();
domUpdate();
buttonPriceUpdate();
