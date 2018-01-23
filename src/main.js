let antColor = [255, 255, 255];
let targetColor = [255, 0, 0];
let backgroundColor = [0, 0, 0];


// var runs = 50;
var runs = 10;
var numAnts = 50;
var runs = 5000;
var numGlobalTargets = 3;
var canvas = document.getElementById('canvas');
var height = canvas.height;
var width = canvas.width;
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function putPixel(coord, col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(coord.x, coord.y, 1, 1 );
}

function clearScreen(col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",255)";
  ctx.fillRect(0, 0, width, height);
}

let contextSize = 3;
var globalTargets = initialGlobalTargets(height, width, true);
var ants = initialAnts(height, width, globalTargets);
var gMap = Array(height).fill([]).map(x => Array(width).fill(0));

/*
 * What is faster? all gMap or all canvas?
 * I think it's certainly faster to read the gMap
 * It may also be faster to draw from the gMap
 *
 * What do we need to do to make the migration?
 * 1. We need a way to tranform gmap -> image and image -> gmap
 * 2. We have to have a function to read the initial image and turn it into a gmap
 * 3. We must draw the gmap
 * 4. We have to transform our "read to temp context" functions too
 *
 *
 * What is the flow?
 * 1. Get the current state of the gMap
 * 2. For each ant, plot your move and then un-plot the previous position
 * 3. At the end, from the gMap we will draw the canvas
 * */

function imageDataToMatrix(id) {

}

function drawImageData() {
  clearScreen(backgroundColor);
  gMap.forEach( row => {
    row.forEach( pix => {
         
    });
  });
}


function updateWorld() {
  /* Add a random ant sometimes */
  if (getRandomInt(0, 20) === 0) {
    let c = getEdgeCoordinate(height, width);
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


// setInterval(updateWorld, 100);
for (var p = 0; p < runs; p++) {
  console.log('Setting timeout...');
  setTimeout(updateWorld, p);
}
