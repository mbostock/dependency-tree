/**
 * Represents an affine transformation. Transformations can be applied to {@link
 * Vector}s, and more generally {@link GraphLayout}s. Instances of this class
 * are mutable and use the builder pattern. For example, to rotate and scale a
 * graph layout, you might say:
 *
 * <pre> var transform = new AffineTransform()
 *   .scale(2).rotate(Math.PI / 2);</pre>
 *
 * When multiple transformations are concatenated, they are postmultiplied (as
 * in OpenGL), meaning that the last transformation is applied first.
 */
function AffineTransform() {
  this._matrix = [ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]; // identity
}

/**
 * Rotates this transformation by the specified angle in radians.
 *
 * @param angle the angle to rotate, in radians.
 * @return this transform.
 */
AffineTransform.prototype.rotate = function(angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var copy = this._matrix.clone();
  this._matrix[0] = copy[0] * cos - copy[1] * sin;
  this._matrix[1] = copy[0] * sin + copy[1] * cos;
  this._matrix[3] = copy[3] * cos - copy[4] * sin;
  this._matrix[4] = copy[3] * sin + copy[4] * cos;
  return this;
};

/**
 * Scales this transformation by the specified factors in x and y. If <i>y</i>
 * is not specified, the <i>x</i> value is used.
 *
 * @param x the x scale factor.
 * @param y the y scale factor; optional.
 * @return this transform.
 */
AffineTransform.prototype.scale = function(x, y) {
  if (arguments.length == 1) {
    y = x;
  }
  this._matrix[0] = this._matrix[0] * x;
  this._matrix[1] = this._matrix[1] * y;
  this._matrix[3] = this._matrix[3] * x;
  this._matrix[4] = this._matrix[4] * y;
  return this;
};

/**
 * Shears this transformation by the specified factor in x and y.
 *
 * @param x the x shear factor.
 * @param y the y shear factor.
 * @return this transform.
 */
AffineTransform.prototype.shear = function(x, y) {
  var copy = this._matrix.clone();
  this._matrix[0] = copy[0] + copy[1] * y;
  this._matrix[1] = copy[0] * x + copy[1];
  this._matrix[3] = copy[3] + copy[4] * y;
  this._matrix[4] = copy[3] * x + copy[4];
  return this;
};

/**
 * Translates this transformation by the specified distance in x and y.
 *
 * @param x the x translation distance.
 * @param y the y translation distance.
 * @return this transform.
 */
AffineTransform.prototype.translate = function(x, y) {
  this._matrix[2] = this._matrix[0] * x + this._matrix[1] * y + this._matrix[2];
  this._matrix[5] = this._matrix[3] * x + this._matrix[4] * y + this._matrix[5];
  return this;
};

/**
 * Applies this transformation to the specified point.
 *
 * @param p the point to transform.
 */
AffineTransform.prototype.transform = function(p) {
  return new Vector(
      this._matrix[0] * p.x + this._matrix[1] * p.y + this._matrix[2],
      this._matrix[3] * p.x + this._matrix[4] * p.y + this._matrix[5]);
};
