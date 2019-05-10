import {
  getEdgeCoordinate,
  COLORS,
  getMoveOptions,
  getRandomInt,
  getRelativeDistance,
  initialAnts,
  initialGuns,
  initialGlobalTargets,
  newMat } from './utils.js';

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
var clickAction = 'nothing';
var numAnts = 1;
var numGlobalTargets = 5;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;

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

function round(x) {
  return Math.floor(x);
}

function antColor(health) {
  return [255 - health, health, 0];
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
  ctx.fillRect(0, 0, width, height);
}

var globalTargets = initialGlobalTargets(gHeight, gWidth, numGlobalTargets, false);
var ants = initialAnts(gHeight, gWidth, globalTargets, 'rand', numAnts);
var guns = initialGuns(gHeight, gWidth, config.guns.numGuns, config.guns.gunRange);
var bullets = [];

var wallItems = [];
var permWallItems = [];

function buildPermWall(w, h) {
  for (var x = 0; x < w; x++ ) {
    permWallItems.push({x: x, y: round(gHeight / 4)});
    permWallItems.push({x: x, y: round(gHeight / 2)});
    permWallItems.push({y: x, x: round(gHeight / 4)});
    permWallItems.push({y: x, x: round(gHeight / 2)});

  }
}
buildPermWall(gWidth, gHeight);

function buildWallItems(w, h) {
  /* Act on wallItems array as a side-effect */
  for (var x = 0; x < w; x ++) {
    for (var y = 0; y < h; y ++) {
      if ((y > 60 && y < 80 ) || (y > 140 && y < 160)) {
        wallItems.push({x: x, y: y, health: 255});
      }
    }
  }
}
// buildWallItems(gWidth, gHeight);


var updates = [];
var draws = [];

function updateWorld() {
  /* Deal with the business logic of the game. */

  function generateNewAnt() {
    /* Generate a new ant from the edge and return it. */
    var c = getEdgeCoordinate(gHeight, gWidth);
    while (globalMap[c.x][c.y] !== COLORS.NOTHING) {
      var c = getEdgeCoordinate(gHeight, gWidth);
    }
    let a = new Ant(c.x, c.y, gWidth, gHeight);
    a.registerTargets(globalTargets);
    return (a);
  }

  function generateSpecificAnt(x, y) {
    /* Generate a new ant from the edge and return it. */
    let c = {x: x, y: y};
    if (globalMap[c.x][c.y] !== COLORS.NOTHING) {
      return undefined;
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
  ants = ants.filter(x => x.health > 0);
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
        ants.filter(a => (a.x === bc.x) && (a.y === bc.y)).forEach(a => a.decHealth(200));
        bullet.dead = true;
      }
    }
    // Make an ant lose health if it hits the ant
  });
  bullets = bullets.filter(x => x.dead === false);

  // numAntsPerCycle = Math.floor(tick / 100);
  if (tick % 200 === 0) {
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
  /*
  for (var i = 0; i < 5; i++) {
    let a = generateSpecificAnt(60 + getRandomInt(0, 5), 60 + getRandomInt(0, 5));
    if (a !== undefined) {
      ants.push(a);
    }
  }*/

  let subt1 = performance.now();
  updates.push(subt1-subt0);
  drawWorld();
  if (tick > config.world.runs || globalTargets.length === 0) {
    if (tick > config.world.runs) {
      console.log("Congratulations, time ran out!");
    } else {
      console.log("You were unable to protect all the targets.");
    }
    clearInterval(globalDrawCancellation);
    showPerformance()
  } else {
    tick += 1;
  }
}

function drawWorld() {
  let subt0 = performance.now();
  clearScreen(backgroundColor);
  ants.forEach(x => putSizedPixel(x.coord(), antColor(x.health), config.world.factor));
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


function newWall(x, y, mX, mY) {
  if (x < mX && y < mY && x > 0 && y > 0 && wallItems.find(i => i.x === x && i.y === y) === undefined) {
    wallItems.push({x: x, y: y, health: 255});
  }
}

function canvasClickHandler(event) {
  if (clickAction === 'add_wall') {
    let x = Math.floor(event.layerX / config.world.factor);
    let y = Math.floor(event.layerY / config.world.factor);
    let p = getMoveOptions({x: x, y: y});
    p.forEach(i => newWall(i.x, i.y, gWidth, gHeight));
  }
  if (clickAction === 'add_gun') {
    let x = Math.floor(event.layerX / config.world.factor);
    let y = Math.floor(event.layerY / config.world.factor);
    guns.push(new Gun(x, y, gWidth, gHeight));
  }
}

function stopMovement() {
  clearInterval(globalDrawCancellation);
}

let drawInterval = setInterval(drawWorld, config.world.timePerRun);

document.getElementById('addWall').addEventListener('mouseup', addWall);
document.getElementById('addGun').addEventListener('mouseup', addGun);
document.getElementById('canvas').addEventListener('mouseup', canvasClickHandler);
document.getElementById('start').addEventListener('mouseup', startMovement, drawInterval);
document.getElementById('stop').addEventListener('mouseup', stopMovement);

// startMovement();
