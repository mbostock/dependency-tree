/**
 * Represents an axis-aligned rectangle in two dimensions.
 *
 * @param x the x-coordinate of the top-left coordinate.
 * @param y the y-coordinate of the top-left coordinate.
 * @param w the width of the rectangle.
 * @param h the height of the rectangle.
 */
function Rectangle(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
}

/**
 * Maps this rectangle into the appropriate sequence of calls to the specified
 * canvas context.
 *
 * @param context the canvas context.
 */
Rectangle.prototype._path = function(context) {
  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x + this.width, this.y);
  context.lineTo(this.x + this.width, this.y + this.height);
  context.lineTo(this.x, this.y + this.height);
  context.closePath();
};

/**
 * Fills this rectangle into the specified context. The {@code fill} method on
 * the specified context will be called, using the associated {@code fillStyle}.
 *
 * @param context the canvas context.
 * @return this rectangle.
 */
Rectangle.prototype.fill = function(context) {
  this._path(context);
  context.fill();
  return this;
};

/**
 * Calculates the strokes of this rectangle, and then fills the stroke into the
 * specified context. The {@code stroke} method on the specified context wil be
 * called, using the associated {@code lineWidth} attribute. The {@code
 * lineCap}, {@code lineJoin}, and {@code miterLimit} are ignored.
 *
 * @param context the canvas context.
 * @return this rectangle.
 */
Rectangle.prototype.stroke = function(context) {
  this._path(context);
  context.stroke();
  return this;
};

/** Returns the circumference of this rectangle. */
Rectangle.prototype.circumference = function() {
  return 2.0 * (this.width + this.height);
};

/** Returns the area of this circle. */
Rectangle.prototype.area = function() {
  return this.width * this.height;
};
