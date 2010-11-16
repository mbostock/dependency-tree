/**
 * Represents a circle in two dimensions.
 *
 * @param x the x-coordinate of the center.
 * @param y the y-coordinate of the center.
 * @param r the radius.
 */
function Circle(x, y, r) {
  this.center = new Vector(x, y);
  this.radius = r;
}

/**
 * Maps this circle into the appropriate sequence of calls to the specified
 * canvas context. Note: this method calls {@code beginPath} on the context, but
 * does not call {@code closePath}. This is because closing the path is not
 * desired in the case of stroke, and will be closed implicitly in the case of
 * fill.
 *
 * @param context the canvas context.
 */
Circle.prototype._path = function(context) {
  context.beginPath();
  context.arc(this.center.x, this.center.y, this.radius,
      0, 2.0 * Math.PI, false);
};

/**
 * Fills this circle into the specified context. The {@code fill} method on the
 * specified context will be called, using the associated {@code fillStyle}.
 *
 * @param context the canvas context.
 * @return this circle.
 */
Circle.prototype.fill = function(context) {
  this._path(context);
  context.fill();
  return this;
};

/**
 * Calculates the strokes of this circle, and then fills the stroke into the
 * specified context. The {@code stroke} method on the specified context wil be
 * called, using the associated {@code lineWidth} attribute. The {@code
 * lineCap}, {@code lineJoin}, and {@code miterLimit} are ignored.
 *
 * @param context the canvas context.
 * @return this circle.
 */
Circle.prototype.stroke = function(context) {
  this._path(context);
  context.stroke();
  return this;
};

/**
 * Returns the distance from this circle to the specified point (<i>x</i>,
 * <i>y</i>). If the specified point is inside the circle, a negative number is
 * returned; if the specified point is exactly on the edge of the circle, 0 is
 * returned.
 *
 * @param x the x-coordinate of the point to test.
 * @param y the y-coordinate of the point to test.
 */
Circle.prototype.distance = function(x, y) {
  return this.center.distance(x, y) - this.radius;
};

/** Returns the diameter of this circle. */
Circle.prototype.diameter = function() {
  return 2.0 * this.radius;
};

/** Returns the circumference of this circle. */
Circle.prototype.circumference = function() {
  return 2.0 * Math.PI * this.radius;
};

/** Returns the area of this circle. */
Circle.prototype.area = function() {
  return Math.PI * this.radius * this.radius;
};
