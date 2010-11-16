/**
 * Represents a line in two dimensions.
 *
 * @param x1 the x-coordinate of the start point.
 * @param y1 the y-coordinate of the start point.
 * @param x2 the x-coordinate of the end point.
 * @param y2 the y-coordinate of the end point.
 */
function Line(x1, y1, x2, y2) {
  Path.call(this);
  this._segments = [
      new Path.Segment(Path.SEG_MOVE, [ new Vector(x1, y1) ]),
      new Path.Segment(Path.SEG_LINE, [ new Vector(x2, y2) ])
    ];
}
Line.prototype = Path.extend();

/**
 * Returns the distance from the specified point to the infinite line colinear
 * with this line segment.
 *
 * @param x the x-coordinate of the point.
 * @param y the y-coordinate of the point.
 */
Line.prototype.distance = function(x, y) {
  var s = this.start(), e = this.end();
  var dx = e.x - s.x, dy = e.y - s.y;
  return ((dx == 0.0) && (dy == 0.0))
      ? s.distance(x, y)
      : Math.abs(dx * (s.y - y) - dy * (s.x - x))
          / Math.sqrt(dx * dx + dy * dy);
};

/** Returns the start point of the line. */
Line.prototype.start = function() {
  return this._segments[0].points[0];
};

/** Returns the end point of the line. */
Line.prototype.end = function() {
  return this._segments[1].points[0];
};

/** Returns the length of this line. */
Line.prototype.length = function() {
  return this.start().distance(this.end());
};

/**
 * Returns true if the two specified line segments intersect.
 *
 * @param p1 the start point of the first line segment.
 * @param p2 the end point of the first line segment.
 * @param q1 the start point of the second line segment.
 * @param q2 the end point of the second line segment.
 */
Line.intersect = function(p1, p2, q1, q2) {
  var a = new Vector(q2.x - q1.x, q2.y - q1.y);
  var b = new Vector(p1.y - p2.y, p2.x - p1.x); // b.perp(), actually
  var c = new Vector(p1.x - q1.x, p1.y - q1.y);

  var d = c.dot(a.perp());
  var f = a.dot(b);
  if (f > 0) {
    if ((d < 0) || (d > f)) {
      return false;
    }
  } else {
    if ((d > 0) || (d < f)) {
      return false;
    }
  }

  var e = c.dot(b);
  if (f > 0) {
    if ((e < 0) || (e > f)) {
      return false;
    }
  } else {
    if ((e > 0) || (e < f)) {
      return false;
    }
  }

  return true;
};
