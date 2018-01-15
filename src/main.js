
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

class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  coord() {
    // console.log(this.x, this.y);
    return {'x': this.x, 'y': this.y};
  }

  chooseNextPath() {
    this.x += getRandomInt(-1, 1);
    this.y += getRandomInt(-1, 1);
  }

  findClosestTarget(targets) {
    var minDist = getDistance({x: 0, y: 0}, {x: width, y: height});
    var minTarget = undefined;
    for (t in targets) {
      var dist = getDistance(this.coord(), t.coord());
      if (dist < minDist) {
        minDist = dist;
        minTarget = t;
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

var ants = [];
for (var i = 0; i < 10; i++) {
  var randX = getRandomInt(0, width);
  var randY = getRandomInt(0, height);
  console.log("Randoms: " + randX + " " + randY);
  ants.push(new Ant(randX, randY));
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
