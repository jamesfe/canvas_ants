const COLORS = {
  NOTHING: 0,
  WALL: 1,
  ANT: 2,
  TARGET: 3,
  PERMWALL: 4
};

export { COLORS };


export function getRandomNum(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
  /* Returns a random number, inclusive of min and max */
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  // return Math.floor(Math.random() * (max - min + 1)) + min;
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
  /* return the distance without doing the expensive sqrt function */
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

export function getRandomCoordinate(h, w) {
  /* Get a random coordinate. */
  var randX = getRandomInt(0, w);
  var randY = getRandomInt(0, h);
  return ({x: randX, y: randY});
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

export function round(x) {
  return Math.round(x);
}

export function roundToDigits(x, numDigits) {
  return Math.round(x * Math.pow(10, numDigits)) / Math.pow(10, numDigits);
}
