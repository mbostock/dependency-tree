/**
 * Represents a vector (or point) in two dimensions.
 *
 * @param x the x-coordinate of the vector.
 * @param y the y-coordinate of the vector.
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * Returns the distance from this vector to the specified vector (<i>x</i>,
 * <i>y</i>).
 *
 * @param x the x-coordinate of the point.
 * @param y the y-coordinate of the point.
 */
Vector.prototype.distance = function(x, y) {
  var dx = this.x - x;
  var dy = this.y - y;
  return Math.sqrt(dx * dx + dy * dy);
};

/** Returns the perpendicular vector to this vector, (-y, x). */
Vector.prototype.perp = function() {
  return new Vector(-this.y, this.x);
};

/** Returns the dot product of this vector with the specified vector. */
Vector.prototype.dot = function(v) {
  return this.x * v.x + this.y * v.y;
};

/** Returns the cross product (Z) of this vector with the specified vector. */
Vector.prototype.cross = function(v) {
  return this.x * v.y - this.y * v.x;
};

/** Returns the string representation of this vector. */
Vector.prototype.toString = function() {
  return "(" + this.x + ", " + this.y + ")";
};
