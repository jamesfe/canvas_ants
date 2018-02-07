import {
  getEdgeCoordinate,
  COLORS,
  getMoveOptions,
  getRandomInt,
  initialAnts,
  initialGlobalTargets,
  newMat } from './utils.js';

import { Ant } from './ant.js';


let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];
let wallColor = [255, 255, 0];

var factor = 4;
var runs = 20;
var numAnts = 2000;
var numGlobalTargets = 3;
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
    .map(a => { return ({color: matrix[a.x][a.y], coord: a}); })
  // We cannot move into walls or other ants, for now we say we can only move into "nothing"
  return (validLocs);
}

function putSizedPixel(coord, col, s) {
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(coord.x * s, coord.y * s, s, s);
}

function clearScreen(col) {
  ctx.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+',255)';
  ctx.fillRect(0, 0, width, height);
}

var globalTargets = initialGlobalTargets(gHeight, gWidth, numGlobalTargets, true);
var ants = initialAnts(gHeight, gWidth, globalTargets, 'rand', numAnts);

var wallItems = [];

function buildWallItems(w, h) {
  /* Act on wallItems array as a side-effect */
  for (var x = 0; x < w; x ++) {
    for (var y = 0; y < h; y ++) {
      if ((y > 80 && y < 100) || (y > 180 && y < 200)) {
        wallItems.push({x: x, y: y});
      }
    }
  }
}
buildWallItems(gWidth, gHeight);


function updateWorld(tick) {
  /* Deal with the business logic of the game. */
  let subt0 = performance.now();
  var globalMap = newMat(gHeight, gWidth);
  // Register on global map
  globalTargets.forEach(x => globalMap[x.x][x.y] = COLORS.TARGET);
  wallItems.forEach(x => globalMap[x.x][x.y] = COLORS.WALL);
  ants.forEach(x => globalMap[x.x][x.y] = COLORS.ANT);

  // Now make some moves
  ants.forEach(ant => {
    /* We remove the ant from the global map */
    let x = ant.x;
    let y = ant.y;
    globalMap[x][y] = COLORS.NOTHING;
    ant.updateTempContext(getTempContext(getMoveOptions(ant.coord()), gHeight, gWidth, globalMap));
    ant.chooseNextPath(tick);
    globalMap[ant.x][ant.y] = COLORS.ANT;
  });

  if (getRandomInt(0, 2) === -10) {
    /* From time to time, allow a random ant to enter the arena. */
    let c = getEdgeCoordinate(gHeight, gWidth);
    if (globalMap[c.x][c.y] === COLORS.NOTHING) {
      let a = new Ant(c.x, c.y, gWidth, gHeight);
      a.registerTargets(globalTargets);
      ants.push(a);
    }
  }

  let subt1 = performance.now();
  console.log("Global update took " + (subt1 - subt0) + " milliseconds.")
  drawWorld();
}

function drawWorld() {
  let subt0 = performance.now();
  clearScreen(backgroundColor);
  globalTargets.forEach(x => putSizedPixel(x.coord(), targetColor, factor));
  ants.forEach(x => putSizedPixel(x.coord(), antColor, factor));
  wallItems.forEach(x => putSizedPixel(x, wallColor, factor));
  let subt1 = performance.now();
  console.log("Global draw took " + (subt1 - subt0) + " milliseconds.")

}

// setInterval(updateWorld, 100);

for (var p = 0; p < runs; p++) {
  setTimeout(updateWorld, p * 100, p);
}
