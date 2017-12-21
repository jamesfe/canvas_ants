
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

for (var i = 0; i < 800; i++) {
  putPixel({'x': i, 'y': i}, [0, 0, 255]);
}

function putPixel(coord, col) {
  ctx.fillStyle = "rgba("+col[0]+","+col[1]+","+col[2]+",128)";
  ctx.fillRect(coord.x, coord.y, 1, 1 );
}
