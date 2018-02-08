import {
  getEdgeCoordinate,
  COLORS,
  getMoveOptions,
  getRandomInt,
  initialAnts,
  initialGlobalTargets,
  newMat } from './utils.js';

import { Ant } from './ant.js';

let targetColor = [0, 0, 255];
let backgroundColor = [0, 0, 0];

var numAntsPerCycle = 20;
var started = false;
var globalDrawCancellation = undefined;
var tick = 0;
var clickAction = 'nothing';
var factor = 3;
var runs = 400;
let timePerRun = 50; // how many ms we want each cycle to take
/* But a side-note on this: Our code has to be efficient enough for the
 * update loop to run in < this amount of time. */
var numAnts = 2000;
var numGlobalTargets = 60;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;

var gHeight = Math.floor(canvas.height / factor);
var gWidth = Math.floor(canvas.width / factor);

var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function getTempContext(inArr, h, w, matrix) {
  /* Given a matrix from getMoveOptions, check the matrix for valid moves. */
  let validLocs = inArr
    .filter(a => a.x >= 0 && a.x < w && a.y >= 0 && a.y < h)
    .map(a => { return ({color: matrix[a.x][a.y], coord: a}); });
  // We cannot move into walls or other ants, for now we say we can only move into "nothing"
  return (validLocs);
}

function antColor(health) {
  return [255 - health, health, 0];
}

function putSizedPixel(coord, col, s) {
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(coord.x * s, coord.y * s, s, s);
}

function clearScreen(col) {
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(0, 0, width, height);
}

var globalTargets = initialGlobalTargets(gHeight, gWidth, numGlobalTargets, false);
var ants = initialAnts(gHeight, gWidth, globalTargets, 'rand', numAnts);

var wallItems = [];

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
buildWallItems(gWidth, gHeight);


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

  let subt0 = performance.now();
  var globalMap = newMat(gHeight, gWidth);
  // Register on global map
  var updateTargets = false;
  let preLength = globalTargets.length;
  globalTargets = globalTargets.filter(x => x.health > 0);
  updateTargets = (preLength !== globalTargets.length);
  globalTargets.forEach(x => globalMap[x.x][x.y] = COLORS.TARGET);
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

  for (var i = 0; i < numAntsPerCycle; i++) {
    let a = generateNewAnt();
    ants.push(a);
  }

  let subt1 = performance.now();
  updates.push(subt1-subt0);
  drawWorld();
  if (tick > runs || globalTargets.length === 0) {
    if (tick > runs) {
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
  globalTargets.forEach(x => putSizedPixel(x.coord(), targetColor, factor));
  ants.forEach(x => putSizedPixel(x.coord(), antColor(x.health), factor));
  wallItems.forEach(x => putSizedPixel(x, [x.health, x.health, 0], factor));
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
    globalDrawCancellation = setInterval(updateWorld, timePerRun);
  }
}

function addWall() {
  clickAction = 'add_wall';
}

function canvasClickHandler(event) {
  if (clickAction === 'add_wall') {
    let x = Math.floor(event.layerX / factor);
    let y = Math.floor(event.layerY / factor);
    wallItems.push({x: x, y: y, health: 255});
    wallItems.push({x: x, y: y + 1, health: 255});
    wallItems.push({x: x + 1, y: y, health: 255});
    wallItems.push({x: x + 1, y: y + 1, health: 255});
  }
}

function stopMovement() {
  clearInterval(globalDrawCancellation);
}

let drawInterval = setInterval(drawWorld, timePerRun);

document.getElementById('addWall').addEventListener('mouseup', addWall);
document.getElementById('canvas').addEventListener('mouseup', canvasClickHandler);
document.getElementById('start').addEventListener('mouseup', startMovement, drawInterval);
document.getElementById('stop').addEventListener('mouseup', stopMovement);

startMovement();
