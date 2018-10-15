
function Vector2(x, y) {
  this.x = x;
  this.y = y;
}

Vector2.prototype = _.extend(Vector2.prototype, {
  translate: function(x, y) {
    return new Vector2(this.x + x, this.y + y);
  }
});