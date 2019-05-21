import { assertEqual, assertNotEqual } from './utils.js';
import {
  sameColor,
  getDistance } from '../src/utils.js';

let tests = {
  testThingsEqual: function () {
    assertEqual(1, 1);
  },
  testThingsNotEqual: function () {
    assertNotEqual(1, 2);
  },
  testSameColor: function() {
    assertEqual(sameColor([1, 2, 3], [1, 2, 3]), true);
    assertNotEqual(sameColor([2, 2, 3], [1, 2, 3]), true);
  },
  testGetDistance: function() {
    // TODO: Strengthen
    assertEqual(getDistance({x: 1, y: 0}, {x: 5, y: 0}), 4);
  }
};

var resultTable = document.getElementById('resultTable');


for (var prop of Object.getOwnPropertyNames(tests)) {
  if (prop.substr(0, 4) === 'test') {
    var newRow = resultTable.appendChild(document.createElement('tr'));
    var titleCell = newRow.appendChild(document.createElement('td'));
    titleCell.innerHTML = prop;

    var secondCell = newRow.appendChild(document.createElement('td'));
    var noErrors = true;
    try {
      tests[prop]();
    }
    catch(error) {
      secondCell.innerHTML = "<pre>" + error + "</pre>";
      secondCell.classList.add('failed');
      noErrors = false;
    }
    if (noErrors) {
      secondCell.innerHTML = 'Passed';
      secondCell.classList.add('passed');
    }
  }
}
