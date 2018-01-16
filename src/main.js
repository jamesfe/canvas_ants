let t0 = performance.now();
let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sameColor(c1, c2) {
  return (c1[0]===c2[0]) && (c1[1]===c2[1]) && (c1[2]===c2[2]);
}

function getDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return Math.sqrt( a*a + b*b );
}

// var runs = 50;
var runs = 3;
var numAnts = 30;
var runs = 500;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;
var ctx = canvas.getContext('2d');

function putPixel(coord, col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",128)";
  ctx.fillRect(coord.x, coord.y, 1, 1 );
}


// setInterval(updateWorld, 100);

class GlobalTarget {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  coord() {
    return {'x': this.x, 'y': this.y};
  }
}

let contextSize = 3;

var globalTargets = [];
for (var i = 0; i < 4; i++) {
  var randX = getRandomInt(0, width);
  var randY = getRandomInt(0, height);
  globalTargets.push(new GlobalTarget(randX, randY));
}

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
  var randX = getRandomInt(0, width);
  var randY = getRandomInt(0, height);
  ants.push(new Ant(randX, randY));
  ants[i].registerTargets(globalTargets);
}

function clearScreen(col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(0, 0, height, width);
}

function updateWorld() {

  let subt0 = performance.now();
  console.log('Updating canvas.');

  let pixelData = ctx.getImageData(0, 0, width, height).data;
  clearScreen(backgroundColor);
  for (i in ants) {
    ants[i].getTempContext(pixelData)
    putPixel(ants[i].coord(), antColor);
    ants[i].chooseNextPath();
  }

  for (i in globalTargets) {
    putPixel(globalTargets[i], targetColor);
  }

  let subt1 = performance.now();
  console.log("Global update took " + (subt1 - subt0) + " milliseconds.")
}

for (var p = 0; p < runs; p++) {
  console.log('Setting timeout...');
  setTimeout(updateWorld, 300);
}

let t1 = performance.now();
console.log("Took " + (t1 - t0) + " milliseconds.")
