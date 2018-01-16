let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];

function getRandomInt(min, max) {
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
var numAnts = 300;
var runs = 50;;
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
  // debugger;
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
    putPixel(ants[i].coord(), antColor);
  }

  let subt1 = performance.now();
  console.log("Global update took " + (subt1 - subt0) + " milliseconds.")
}

clearScreen(backgroundColor);
for (var p = 0; p < runs; p++) {
  console.log('Setting timeout...');
  setTimeout(updateWorld, 300);
}
