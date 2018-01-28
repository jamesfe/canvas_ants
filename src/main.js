let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];
let wallColor = [255, 255, 0];


var factor = 4;
// var runs = 50;
var runs = 10;
var numAnts = 50;
var runs = 50;
var numGlobalTargets = 3;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;

var gHeight = Math.floor(canvas.height / factor);
var gWidth = Math.floor(canvas.width / factor);

var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function putPixel(coord, col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(coord.x, coord.y, 1, 1 );
}

function putSizedPixel(coord, col, s) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(coord.x * s, coord.y * s, s, s);
}

function clearScreen(col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(0, 0, width, height);
}

let contextSize = 3;
var globalTargets = initialGlobalTargets(gHeight, gWidth, true);
var ants = initialAnts(gHeight, gWidth, globalTargets, "rand");

// This is the 'presence matrix', it has different codes for different items (ant, wall, etc)
var pMat = Array(gHeight).fill([]).map(x => Array(gWidth).fill(0));

function newMat(h, w) { return (new Array(h).fill([]).map(x => Array(w).fill(0)));}


var wallItems = []

function buildWallItems(w, h) {
  /* Act on wallItems array as a side-effect */
  for (var x = 0; x < w; x ++) {
    for (var y = 0; y < w; y ++) {
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

/*
function drawImageData() {
  clearScreen(backgroundColor);
  gMap.forEach( row => {
    row.forEach( pix => {

    });
  });
}
*/


function updateWorld(tick) {
  /* Add a random ant sometimes */
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
    // let pixelData = ctx.getImageData(0, 0, width, height).data;
    let args = ants[i].getContextArguments();
    let pixelData = ctx.getImageData(args.x, args.y, args.w, args.h);
    // ants[i].getTempContext(pixelData)
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
  console.log('Setting timeout...');
  setTimeout(updateWorld, p, p);
}
