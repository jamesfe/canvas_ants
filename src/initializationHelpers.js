import { Ant } from './ant.js';
import { Gun } from './gun.js';
import { Target } from './target.js';

import {
  getRandomCoordinate,
  getEdgeCoordinate,
  getRandomInt,
  round } from './utils.js';

export function initialGlobalTargets(h, w, num, debug) {
  /* Generate some random targets but otherwise just put one in the middle for debug mode */
  h -= 1;
  w -= 1;
  var tgts = [];
  if (debug === true) {
    tgts.push(new Target(Math.floor(w/2), Math.floor(h/2)));
  } else {
    for (var i = 0; i < num; i++) {
      let c = getRandomCoordinate(h * 0.6, w * 0.6);
      tgts.push(new Target(c.x + (w * 0.2), c.y + (h * 0.2)));
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

export function initialGuns(h, w, num, range) {
  /* Generate some initial guns */
  h -= 1;
  w -= 1;

  var a = [];
  var c = {x: 0, y: 0};
  for (var i = 0; i < num; i++) {
    c = getRandomCoordinate(h, w);
    a.push(new Gun(c.x, c.y, w, h, range));
  }
  return (a);

}

export function buildPermRuins(w, h, items) {
  for (var x = 0; x < w; x++) {
    for (var y = 0; y < h; y++) {
      if (getRandomInt(0, 30) === 0) {
        items.push({x: x, y: y});
      }
    }
  }
  return (items);
}

export function buildWallRuins(w, h, items) {
  /* Act on wallItems array as a side-effect */
  for (var x = 0; x < w; x ++) {
    for (var y = 0; y < h; y ++) {
      if (getRandomInt(0, 10) === 0) {
        items.push({x: x, y: y, health: 255});
      }
    }
  }
  return (items);
}

export function buildPermWall(w, h, items) {
  /* call-by-sharing means items is altered */
  for (var x = 0; x < w; x++ ) {
    if (getRandomInt(0, 2) === 1) {
      items.push({x: x, y: round(h / 4)});
      items.push({x: x, y: round(h / 2)});
      items.push({y: x, x: round(h / 4)});
      items.push({y: x, x: round(h / 2)});
    }
  }
  return (items);
}

export function buildWallItems(w, h, items) {
  /* Act on wallItems array as a side-effect */
  for (var x = 0; x < w; x ++) {
    for (var y = 0; y < h; y ++) {
      if ((y > 60 && y < 80 ) || (y > 140 && y < 160)) {
        items.push({x: x, y: y, health: 255});
      }
    }
  }
  return (items);
}
