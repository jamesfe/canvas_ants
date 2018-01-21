let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];

function getRandomInt(min, max) {
  /* Returns a random number, inclusive of min and max */
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sameColor(c1, c2) {
  return (typeof c1 !== 'undefined' && typeof c2 !== 'undefined' && c1[0]===c2[0] && c1[1]===c2[1] && c1[2]===c2[2]);
}

function getDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return Math.sqrt( a*a + b*b );
}

// var runs = 50;
var runs = 10;
var numAnts = 50;
var runs = 5000;
var numGlobalTargets = 3;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;
var ctx = canvas.getContext('2d');

function putPixel(coord, col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(coord.x, coord.y, 1, 1 );
}

function sameCoord(c1, c2) {
  return (c1.x === c2.x && c1.y === c2.y)
}

function getEdgeCoordinate() {
  /* Get a random edge coordinate. */
  // TODO: Depends on height, width
  var randX, randY;
  switch (getRandomInt(0, 3)) {
    case 0: // top
      randX = 0;
      randY = getRandomInt(0, height);
      break;
    case 1: // bottom
      randX = width;
      randY = getRandomInt(0, height);
      break;
    case 2: // left
      randY = 0;
      randX = getRandomInt(0, width);
      break;
    case 3: // right
      randY = height;
      randX = getRandomInt(0, width);
      break;
  }
  return ({x: randX, y: randY});
}

function getRandomCoordinate() {
  /* Get a random coordinate. */
  // TODO: Depends on height, width
  var randX = getRandomInt(0, width);
  var randY = getRandomInt(0, height);
  return ({x: randX, y: randY});
}

// setInterval(updateWorld, 100);

let contextSize = 3;

var globalTargets = [];
globalTargets.push(new Target(width/2, height/2));
/*
for (var i = 0; i < numGlobalTargets; i++) {
  let c = getRandomCoordinate();
  globalTargets.push(new Target(c.x, c.y));
} */

function generateDistanceMap(targets, height, width) {
  /* Returns a matrix keyed by [w][h] */
  var maxDist = getDistance({x: 0, y: 0}, {x: width, y: height});
  var distanceMap = Array(height).fill([]).map(x => Array(width).fill(0));
  for (var h = 0; h < height; h++) {
    for (var w = 0; w < width; w++) {
      var minTarget = undefined;
      for (var t in targets) {
        var minDist = maxDist; // set it to the max value, then find smaller values
        var dist = getDistance({x: h, y: w}, targets[t].coord());
        if (dist < minDist) {
          minDist = dist;
          minTarget = targets[t];
        }
      }
      distanceMap[h][w] = (255 * minDist) / maxDist; // scale so it's <= 255
    }
  }
  return (distanceMap);
}

var ants = [];
console.log("Generating random ant locations.");
for (var i = 0; i < numAnts; i++) {
  let c = getEdgeCoordinate();
  ants.push(new Ant(c.x, c.y));
  ants[i].registerTargets(globalTargets);
}

function clearScreen(col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(0, 0, width, height);
}



function updateWorld() {
  if (getRandomInt(0, 20) === 0) {
    let c = getEdgeCoordinate();
    let a = new Ant(c.x, c.y);
    a.registerTargets(globalTargets);
    ants.push(a);
  }
  let subt0 = performance.now();

  // clearScreen(backgroundColor);
  for (i in globalTargets) {
    putPixel(globalTargets[i], targetColor);
  }

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
}

clearScreen(backgroundColor);
ctx.fillStyle = "rgba(255, 255, 0, 255)"
ctx.fillRect(Math.floor(width/4), Math.floor(height/4), width/2, height/2)
ctx.fillStyle = "rgba(0, 0, 0, 255)"
ctx.fillRect(Math.floor(width/3), Math.floor(height/3), width/3, height/3)

for (var p = 0; p < runs; p++) {
  console.log('Setting timeout...');
  setTimeout(updateWorld, p);
}
