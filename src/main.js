import { initialAnts, initialGlobalTargets, newMat } from './utils.js';

let COLORS = {
  WALL: 1,
  ANT: 2
};

let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];
let wallColor = [255, 255, 0];


var factor = 4;
var runs = 10;
var numAnts = 50;
var numGlobalTargets = 3;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;

var gHeight = Math.floor(canvas.height / factor);
var gWidth = Math.floor(canvas.width / factor);

var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function getMoveOptions(coord) {
  /* Given a {x: 1, y: 2} style object, find the adjacent cells. */
  let x = coord.x;
  let y = coord.y;
  var retVals = [];
  retVals.push({x: x - 1, y: y + 1});
  retVals.push({x: x - 1, y: y});
  retVals.push({x: x - 1, y: y - 1});
  retVals.push({x: x, y: y + 1});
  retVals.push({x: x, y: y}); // center
  retVals.push({x: x, y: y - 1});
  retVals.push({x: x + 1, y: y + 1});
  retVals.push({x: x + 1, y: y});
  retVals.push({x: x + 1, y: y - 1});
  return (retVals);
}

function getValidMoveSites(inArr, h, w, matrix) {
  /* Given a matrix from getMoveOptions, check the matrix for valid moves. */
  let validLocs = inArr
    .filter(a => a.x >= 0 && a.x <= w && a.y >= 0 && a.y <= h)
    .map(a => { return ({color: matrix[a.x][a.y], coord: a}); })
    .filter(a => a.color != COLORS.WALL);
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

function imageDataToMatrix(id) {
  /* Convert an image to a presence matrix (easy detection of walls, maybe) */

}

function updateWorld(tick) {
  /* Add a random ant sometimes */
  var globalMap = newMat(gHeight, gWidth);
  // Register on global map
  wallItems.forEach(x => globalMap[x.x][x.y] = COLORS.WALL);
  ants.forEach(x => globalMap[x.x][x.y] = COLORS.ANT);

  // Now make some moves
  ants.forEach(ant => {
    // Remove ant from the globalMap
    ant.updateTc(getValidMoveSites(getMoveOptions(ant.coord()), gHeight, gWidth, globalMap));
    ant.chooseNextPath();
    // Make the move
    // Add the ant to the map
  });

  /*
  if (getRandomInt(0, 20) === 0) {
    let c = getEdgeCoordinate(height, width);
    let a = new Ant(c.x, c.y);
    a.registerTargets(globalTargets);
    ants.push(a);
  }
  let subt0 = performance.now();

  // clearScreen(backgroundColor);

  for (i in ants) {
    let args = ants[i].getContextArguments();
    let pixelData = ctx.getImageData(args.x, args.y, args.w, args.h);
    ants[i].getTempContextFromSmall(pixelData.data);
    putPixel(ants[i].coord(), backgroundColor);
    ants[i].chooseNextPath();
    if (typeof ants[i].biteTarget != 'undefined') {
      let newColor = ants[i].biteTarget.color[0] - 15;
      // console.log("Biting, new color: ", newColor, ants[i].biteTarget.target);
      if (newColor < 0) { newColor = 0; }
      putPixel(ants[i].biteTarget.target, [newColor, newColor, 0, 255])
    }
    putPixel(ants[i].coord(), antColor);
  }

  let subt1 = performance.now();
  console.log("Global update took " + (subt1 - subt0) + " milliseconds.")
  */
  drawWorld();
}

function drawWorld() {
  clearScreen(backgroundColor);
  globalTargets.forEach(x => putSizedPixel(x.coord(), targetColor, factor));
  ants.forEach(x => putSizedPixel(x.coord(), antColor, factor));
  wallItems.forEach(x => putSizedPixel(x, wallColor, factor));
}

/*
 * TODO: Delete this code, it should no longer be necessary
clearScreen(backgroundColor);
ctx.fillStyle = "rgba(255, 255, 0, 255)"
ctx.fillRect(Math.floor(width/4), Math.floor(height/4), width/2, height/2)
ctx.fillStyle = "rgba(0, 0, 0, 255)"
ctx.fillRect(Math.floor(width/3), Math.floor(height/3), width/3, height/3)
*/

// setInterval(updateWorld, 100);
for (var p = 0; p < runs; p++) {
  setTimeout(updateWorld, p, p);
}
