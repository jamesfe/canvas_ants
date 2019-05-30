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

import { World } from './world.js';
import { Ant } from './ant.js';
import { Gun } from './gun.js';


var canvas = document.getElementById('canvas');
canvas.height = config.world.height;
canvas.width = config.world.width;

var world = new World(canvas, config);

let targetColor = [0, 0, 255];
let gunColor = [255, 255, 255];
let bulletColor = gunColor;
let backgroundColor = [0, 0, 0];

var started = false;
var globalDrawCancellation = undefined;
var clickAction = 'nothing';

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

/* DOM elements */
let domTickDisplay = document.getElementById('tickDisplay');
let domAntsKilled = document.getElementById('antsKilledDisplay');
let domBudgetDisplay = document.getElementById('budgetDisplay');

function updateWorld() {
  /* Deal with the business logic of the game. */

  world.updateWorld();
  drawWorld();

  if (tick > config.world.runs || globalTargets.length === 0) {
    if (tick > config.world.runs) {
      console.log('Congratulations, time ran out!');
    } else {
      console.log('You were unable to protect all the targets.');
    }
    clearInterval(globalDrawCancellation);
  } else {
    tick += 1;
  }
}

function drawWorld() {
  clearScreen(backgroundColor);
  world.ants.forEach(x => putSizedPixel(x.coord(), x.antColor(), config.world.factor));
  world.wallItems.forEach(x => putSizedPixel(x, [x.health, x.health, 0], config.world.factor));
  world.permWallItems.forEach(x => putSizedPixel(x, [255, 0, 0], config.world.factor));
  world.globalTargets.forEach(x => putSizedPixel(x.coord(), targetColor, config.world.factor));
  world.guns.forEach(x => putSizedPixel(x.coord(), gunColor, config.world.factor));
  world.bullets.forEach(x => {
    let crd = x.coord();
    if (crd !== undefined) {
      putSingleSizedPixel(x.coord(), bulletColor, config.world.factor, 2);
    }
  });
}

function buttonPriceUpdate() {
  document.getElementById('addWall').innerHTML = 'Add Wall (' + config.prices.wall.toString() + ')';
  document.getElementById('addGun').innerHTML = 'Add Gun (' + config.prices.gun.toString() + ')';
  document.getElementById('addPermWall').innerHTML = 'Add Permanent Wall (' + config.prices.permWall.toString() + ')';
}

function domUpdate() {
  /* DOM Updates: Show scores, tick counter, etc. */
  domTickDisplay.innerHTML = world.tick;
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

startMovement();
// domUpdate();
buttonPriceUpdate();
