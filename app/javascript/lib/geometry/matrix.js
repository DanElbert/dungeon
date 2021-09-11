
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
  // Multiply each column by the matrix
  const result0 = this.pointMultiply(m.arr[0], m.arr[3], m.arr[6]);
  const result1 = this.pointMultiply(m.arr[1], m.arr[4], m.arr[7]);
  const result2 = this.pointMultiply(m.arr[2], m.arr[5], m.arr[8]);

  return new TransformMatrix([
    result0[0], result1[0], result2[0],
    result0[1], result1[1], result2[1],
    result0[2], result1[2], result2[2]
  ]);
};

TransformMatrix.prototype.pointMultiply = function(x, y, z) {
  const c0r0 = this.arr[0];
  const c1r0 = this.arr[1];
  const c2r0 = this.arr[2];
  const c0r1 = this.arr[3];
  const c1r1 = this.arr[4];
  const c2r1 = this.arr[5];
  const c0r2 = this.arr[6];
  const c1r2 = this.arr[7];
  const c2r2 = this.arr[8];

  const resultX = (x * c0r0) + (y * c1r0) + (z * c2r0);
  const resultY = (x * c0r1) + (y * c1r1) + (z * c2r1);
  const resultZ = (x * c0r2) + (y * c1r2) + (z * c2r2);

  return [resultX, resultY, resultZ];
};

export default TransformMatrix;