
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return Math.sqrt( a*a + b*b );
}

var runs = 50;
// var runs = 5000;
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

class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tc = Array(contextSize).fill([]).map(x => Array(contextSize).fill(0));
  }

  coord() {
    // console.log(this.x, this.y);
    return {'x': this.x, 'y': this.y};
  }

  chooseNextPath() {
    var choice = undefined;
    if (getRandomInt(0, 3) === 0) {
      choice = this.randomWalk()
    } else {
      choice = this.headToTarget()
    }
    this.x = choice.x;
    this.y = choice.y;
  }

  randomWalk() {
    return {
      x: this.x + getRandomInt(-1, 1),
      y: this.y + getRandomInt(-1, 1)
    };
  }

  headToTarget() {
    let tgt = this.findClosestTarget();
    var dx = 0;
    var dy = 0;
    if (this.x < tgt.x) { dx = 1; }
    if (this.x > tgt.x) { dx = -1; }
    if (this.y < tgt.y) { dy = 1; }
    if (this.y > tgt.y) { dy = -1; }

    return {
      x: this.x + dx,
      y: this.y + dy
    };
  }

  registerTargets(targets) {
    this.targets = targets;
  }

  findClosestTarget() {
    var minDist = getDistance({x: 0, y: 0}, {x: width, y: height});
    var minTarget = undefined;
    for (var t in this.targets) {
      var dist = getDistance(this.coord(), this.targets[t].coord());
      if (dist < minDist) {
        minDist = dist;
        minTarget = this.targets[t];
      }
    }
    return(minTarget);
  }
}

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
for (var i = 0; i < 10; i++) {
  var randX = getRandomInt(0, width);
  var randY = getRandomInt(0, height);
  console.log("Randoms: " + randX + " " + randY);
  ants.push(new Ant(randX, randY));
  ants[i].registerTargets(globalTargets);
}

function updateWorld() {
  console.log('Updating canvas.');
  for (i in ants) {
    console.log('Updating ant ' + i);
    putPixel(ants[i].coord(), [0, 0, 0]);
    ants[i].chooseNextPath();
  }

  for (i in globalTargets) {
    putPixel(globalTargets[i], [255, 0, 0]);
  }

}

for (var p = 0; p < runs; p++) {
  console.log('Setting timeout...');
  setTimeout(updateWorld, 500);
}
