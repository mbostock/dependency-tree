/**
 * Represents a b-spline (or "basis" spline). The b-spline is converted lazily
 * into a path, per the {@code CanvasRenderingContext2D} API, when it needs to
 * be rendered via the {@link #stroke} or {@link #fill} methods.
 *
 * <p>Note that while {@link Path} can be used to represent multiple disjoint
 * paths via {@code moveTo}, splines use a simpler single-path representation.
 * Furthermore, since a b-spline does not intersect its control points, the
 * naming {@code curveTo} would be misleading; instead a single {@link #add}
 * method is provided to add control points to the spline. Like {@code Path},
 * this uses the builder pattern:
 *
 * <pre> var s = new BasisSpline().add(10, 10).add(20, 20).add(30, 10);</pre>
 *
 * Once a path is created, it can be filled or stroked into a given canvas
 * context using {@link #fill} and {@link #stroke} respectively. The underlying
 * path can also be optained via {@link #path}.
 */
function BasisSpline() {
  Path.call(this);
  this._points = [];
}
BasisSpline.prototype = Path.extend();

/**
 * Connects the last point in the subpath to the given point (<i>x</i>,
 * <i>y</i>) using a cubic Bezier curve with control points (<i>cp1x</i>,
 * <i>cp1y</i>) and (<i>cp2x</i>, <i>cp2y</i>). Then it adds the given point
 * (<i>x</i>, <i>y</i>) to the subpath.
 *
 * @return this spline.
 * @param x the x-coordinate of the new point.
 * @param x the y-coordinate of the new point.
 */
BasisSpline.prototype.add = function(x, y) {
  this._points.push(new Vector(x, y));
  this._segments = null;
  return this;
};

/**
 * Adds all of the specified points to this spline.
 *
 * @return this spline.
 * @param pts an array of {@link Vector}s.
 */
BasisSpline.prototype.addAll = function(pts) {
  this._points.addAll(pts);
  this._segments = null;
  return this;
};

/**
 * Empties all of the control points from the spline.
 *
 * @return this spline.
 */
BasisSpline.prototype.clear = function() {
  this._points = [];
  this._segments = null;
  return this;
};

/**
 * Straightens this spline using the specified <i>beta</i> parameter. Control
 * points are linearly interpolated towards new equispaced control points along
 * the line between the start and end points of the spline. More formally, for
 * each control point in the spline, a new control point is generated such that
 *
 * <i>P_i' = B * P_i + (1 - B)(P_0 + (P_{N-1} - P_0) i / (N - 1))</i>
 *
 * where <i>B</i> is the specified beta parameter, <i>N</i> is the number of
 * control points, <i>P_0</i> is the first control point, and <i>P_{N-1}</i> is
 * the last control point.
 *
 * @param beta the straightness parameter, in [0, 1].
 * @return this spline.
 */
BasisSpline.prototype.straighten = function(beta) {
  var z = this._points;
  var e = z.length - 1;
  var dx = z[e].x - z[0].x;
  var dy = z[e].y - z[0].y;
  for (var i = 1; i < e; i++) {
    var p = z[i];
    p.x = beta * p.x + (1.0 - beta) * (z[0].x + i * dx / e);
    p.y = beta * p.y + (1.0 - beta) * (z[0].y + i * dy / e);
  }
  this._segments = null;
  return this;
};

/**
 * Returns the control points associated with this spline. The returned array
 * should be considered unmodifiable; changes to the specified array will cause
 * the behavior of this class to be undefined.
 */
BasisSpline.prototype.points = function() {
  return this._points;
};

/** Returns the segments associated with this spline. */
BasisSpline.prototype.segments = function() {
  if (this._segments) {
    return this._segments;
  }
  this._segments = [];
  var points = this._points;
  if (!points) {
    var s = Function.stacktrace();
    throw s;
  }
  switch (points.length) {
    case 0: break;
    case 1: {
      this.moveTo(points[0].x, points[0].y);
      break;
    }
    case 2: {
      this.moveTo(points[0].x, points[0].y);
      this.lineTo(points[1].x, points[1].y);
      break;
    }
    default: {
      this.moveTo(points[0].x, points[0].y);
      var p0 = points[0];
      var p1 = p0;
      var p2 = p0;
      var p3 = points[1];
      this._basisCurveTo(p0, p1, p2, p3);
      for (var i = 2; i < points.length; i++) {
        p0 = p1;
        p1 = p2;
        p2 = p3;
        p3 = points[i];
        this._basisCurveTo(p0, p1, p2, p3);
      }
      for (var j = 0; j < 2; j++) {
        p0 = p1;
        p1 = p2;
        p2 = p3;
        this._basisCurveTo(p0, p1, p2, p3);
      }
      break;
    }
  }
  return this._segments;
};

/**
 * Matrix to transform basis (b-spline) control points to bezier control
 * points. Derived from FvD 11.2.8.
 */
BasisSpline._basisToBezier = [
  [ 1.0/6.0, 4.0/6.0, 1.0/6.0, 0.0/6.0 ],
  [ 0.0/6.0, 4.0/6.0, 2.0/6.0, 0.0/6.0 ],
  [ 0.0/6.0, 2.0/6.0, 4.0/6.0, 0.0/6.0 ],
  [ 0.0/6.0, 1.0/6.0, 4.0/6.0, 1.0/6.0 ]
];

/**
 * Converts the specified b-spline curve segment to a bezier curve compatible
 * with {@code bezierCurveTo}.
 */
BasisSpline.prototype._basisCurveTo = function(p0, p1, p2, p3) {
  var b1 = Path._weightCurve(BasisSpline._basisToBezier[1], p0, p1, p2, p3);
  var b2 = Path._weightCurve(BasisSpline._basisToBezier[2], p0, p1, p2, p3);
  var b3 = Path._weightCurve(BasisSpline._basisToBezier[3], p0, p1, p2, p3);
  this.bezierCurveTo(b1.x, b1.y, b2.x, b2.y, b3.x, b3.y);
};
