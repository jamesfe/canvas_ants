import { Target } from './target.js';
import { Ant } from './ant.js';

const COLORS = {
  NOTHING: 0,
  WALL: 1,
  ANT: 2,
  TARGET: 3
};

export { COLORS };


export function getRandomInt(min, max) {
  /* Returns a random number, inclusive of min and max */
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sameColor(c1, c2) {
  return (typeof c1 !== 'undefined' && typeof c2 !== 'undefined' && c1[0]===c2[0] && c1[1]===c2[1] && c1[2]===c2[2]);
}

export function getDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return Math.sqrt( a*a + b*b );
}

export function getRelativeDistance(p1, p2) {
  var a = p1.x - p2.x;
  var b = p1.y - p2.y;

  return (a*a + b*b);
}

export function sameCoord(c1, c2) {
  /* If it's the same coordinate, return true */
  return (c1.x === c2.x && c1.y === c2.y);
}

export function getEdgeCoordinate(h, w) {
  /* Get a random edge coordinate. */
  var randX, randY;
  h -= 1;
  w -= 1;
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

export function initialGlobalTargets(h, w, num, debug) {
  /* Generate some random targets but otherwise just put one in the middle for debug mode */
  h -= 1;
  w -= 1;
  var tgts = [];
  if (debug === true) {
    tgts.push(new Target(Math.floor(w/2), Math.floor(h/2)));
  } else {
    for (var i = 0; i < num; i++) {
      let c = getRandomCoordinate(h, w);
      tgts.push(new Target(c.x, c.y));
    }
  }
  return (tgts);
}

export function initialAnts(h, w, tgts, type, num) {
  /* Generate some initial ants */
  h -= 1;
  w -= 1;
  var a = [];
  var c = {x: 0, y: 0};
  for (var i = 0; i < num; i++) {
    switch (type) {
    case 'edge':
      c = getEdgeCoordinate(h, w);
      break;
    case 'rand':
      c = getRandomCoordinate(h, w);
      break;
    }
    a.push(new Ant(c.x, c.y, w, h));
    a[i].registerTargets(tgts);
  }
  return (a);
}

/*
function generateDistanceMap(targets, height, width) {
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
*/

export function newMat(h, w) {
  return (new Array(h).fill([]).map(x => Array(w).fill(0)));
}

export function getMoveOptions(coord) {
  /* Given a {x: 1, y: 2} style object, find the adjacent cells. */
  let x = coord.x;
  let y = coord.y;
  var retVals = [];
  if (x > 0) { // Premature optimization
    retVals.push({x: x - 1, y: y + 1});
    retVals.push({x: x - 1, y: y});
    retVals.push({x: x - 1, y: y - 1});
  }
  retVals.push({x: x, y: y + 1});
  retVals.push({x: x, y: y}); // center
  retVals.push({x: x, y: y - 1});
  retVals.push({x: x + 1, y: y + 1});
  retVals.push({x: x + 1, y: y});
  retVals.push({x: x + 1, y: y - 1});
  return (retVals);
}

