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


function sameCoord(c1, c2) {
  return (c1.x === c2.x && c1.y === c2.y)
}

function getEdgeCoordinate(h, w) {
  /* Get a random edge coordinate. */
  var randX, randY;
  switch (getRandomInt(0, 3)) {
    case 0: // top
      randX = 0;
      randY = getRandomInt(0, h);
      break;
    case 1: // bottom
      randX = w;
      randY = getRandomInt(0, h);
      break;
    case 2: // left
      randY = 0;
      randX = getRandomInt(0, w);
      break;
    case 3: // right
      randY = h;
      randX = getRandomInt(0, w);
      break;
  }
  return ({x: randX, y: randY});
}

function getRandomCoordinate(h, w) {
  /* Get a random coordinate. */
  var randX = getRandomInt(0, w);
  var randY = getRandomInt(0, h);
  return ({x: randX, y: randY});
}

function initialGlobalTargets(h, w, debug) {
  /* Generate some random targets but otherwise just put one in the middle for debug mode */
  var tgts = [];
  if (debug === true) {
    tgts.push(new Target(width/2, height/2));
  } else {
    for (var i = 0; i < numGlobalTargets; i++) {
      let c = getRandomCoordinate(height, width);
      tgts.push(new Target(c.x, c.y));
    }
  }
  return (tgts);
}

function initialAnts(h, w, tgts) {
  /* Generate some initial ants */
  var a = [];
  for (var i = 0; i < numAnts; i++) {
    let c = getEdgeCoordinate(height, width);
    a.push(new Ant(c.x, c.y));
    a[i].registerTargets(tgts);
  }
  return (a);
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