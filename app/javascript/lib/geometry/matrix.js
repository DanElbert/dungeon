
function TransformMatrix(arr) {
  this.arr = arr;
}

TransformMatrix.Identity = new TransformMatrix([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]);

TransformMatrix.prototype.rotate = function(rads) {
  var cos = Math.cos(-rads);
  var sin = Math.sin(-rads);
  var m = new TransformMatrix([
    cos, sin, 0,
    -sin, cos, 0,
    0, 0, 1
  ]);

  return this.matrixMultiply(m);
};

TransformMatrix.prototype.translate = function(x, y) {
  var m = new TransformMatrix([
    1, 0, x,
    0, 1, y,
    0, 0, 1
  ]);

  return this.matrixMultiply(m);
};

TransformMatrix.prototype.scale = function(x, y) {
  var m = new TransformMatrix([
    x, 0, 0,
    0, y, 0,
    0, 0, 1
  ]);

  return this.matrixMultiply(m);
};

TransformMatrix.prototype.matrixMultiply = function(m) {
  var column0 = [m.arr[0], m.arr[3], m.arr[6]];
  var column1 = [m.arr[1], m.arr[4], m.arr[7]];
  var column2 = [m.arr[2], m.arr[5], m.arr[8]];

  // Multiply each column by the matrix
  var result0 = this.pointMultiply(column0);
  var result1 = this.pointMultiply(column1);
  var result2 = this.pointMultiply(column2);

  return new TransformMatrix([
    result0[0], result1[0], result2[0],
    result0[1], result1[1], result2[1],
    result0[2], result1[2], result2[2]
  ]);
};

TransformMatrix.prototype.pointMultiply = function(p) {
  var x = p[0];
  var y = p[1];
  var z = p[2];

  var c0r0 = this.arr[0];
  var c1r0 = this.arr[1];
  var c2r0 = this.arr[2];
  var c0r1 = this.arr[3];
  var c1r1 = this.arr[4];
  var c2r1 = this.arr[5];
  var c0r2 = this.arr[6];
  var c1r2 = this.arr[7];
  var c2r2 = this.arr[8];

  var resultX = (x * c0r0) + (y * c1r0) + (z * c2r0);
  var resultY = (x * c0r1) + (y * c1r1) + (z * c2r1);
  var resultZ = (x * c0r2) + (y * c1r2) + (z * c2r2);

  return [resultX, resultY, resultZ];
};

export default TransformMatrix;