/**
 * Represents a path, per the {@code CanvasRenderingContext2D} path API. Paths
 * are composed of various segments; only the {@code moveTo}, {@code lineTo} and
 * {@code bezierCurveTo} segment types are supported. A path can be constructed
 * using the builder pattern. For example:
 *
 * <pre> var p = new Path().moveTo(10, 10).lineTo(20, 20).lineTo(30, 10);</pre>
 *
 * Once a path is created, it can be filled or stroked into a given canvas
 * context using {@link #fill} and {@link #stroke} respectively.
 */
function Path() {}

/** Encapsulates each segment of the path using a type and array of points. */
Path.Segment = function(type, points) {
  this.type = type;
  this.points = points;
};

/** A {@link #moveTo} segment; one point. */
Path.SEG_MOVE = 1;

/** A {@link #lineTo} segment; one point. */
Path.SEG_LINE = 2;

/** A {@link #bezierCurveTo} segment; three points. */
Path.SEG_BEZIER = 3;

/**
 * Maps this path object into the appropriate sequence of calls to the specified
 * canvas context. Note: this method calls {@code beginPath} on the context, but
 * does not call {@code closePath}. This is because closing the path is not
 * desired in the case of stroke, and will be closed implicitly in the case of
 * fill.
 *
 * @param context the canvas context.
 */
Path.prototype._path = function(context) {
  context.beginPath();
  var segments = this.segments();
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    switch (segment.type) {
      case Path.SEG_MOVE: {
        var p = segment.points[0];
        context.moveTo(p.x, p.y);
        break;
      }
      case Path.SEG_LINE: {
        var p = segment.points[0];
        context.lineTo(p.x, p.y);
        break;
      }
      case Path.SEG_BEZIER: {
        var p = segment.points[0];
        var cp1 = segment.points[1];
        var cp2 = segment.points[2];
        context.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
        break;
      }
    }
  }
};

/**
 * Fills all of the subpaths of this path into the specified context. The {@code
 * fill} method on the specified context will be called, using the associated
 * {@code fillStyle}, and the non-zero winding number rule. Open subpaths will
 * be implicitly closed when being filled.
 *
 * @param context the canvas context.
 * @return this path.
 */
Path.prototype.fill = function(context) {
  this._path(context);
  context.fill();
  return this;
};

/**
 * Calculates the strokes of all the subpaths of this path, and then fills the
 * combined stroke into the specified context. The {@code stroke} method on the
 * specified context wil be called, using the associated {@code lineWidth},
 * {@code lineCap}, {@code lineJoin}, and (if appropriate) {@code miterLimit}
 * attributies.
 *
 * @param context the canvas context.
 * @return this path.
 */
Path.prototype.stroke = function(context) {
  this._path(context);
  context.stroke();
  return this;
};

/**
 * Returns true if the specified point (<i>x</i>, <i>y</i>) is inside this path,
 * as determined by the non-zero winding number rule. Points on the path itself
 * are considered to be inside the path. Note that the point is treated in the
 * canvas coordinate space unaffected by the current transformation.
 *
 * @param context the canvas context.
 * @param x the x-coordinate of the point to test.
 * @param y the y-coordinate of the point to test.
 */
Path.prototype.contains = function(context, x, y) {
  this._path(context);
  return context.isPointInPath(x, y);
};

/**
 * Returns the segments associated with this path.
 *
 * <p>The default implementation uses a private array, {@code _segments}.
 * Subclasses should override this method to initialize the private array if the
 * segments are derived from other geometry (e.g., spline control points).
 */
Path.prototype.segments = function() {
  if (!this._segments) {
    this._segments = [];
  }
  return this._segments;
};

/**
 * Creates a new subpath with the specified point as its first (and only) point.
 *
 * @param x the starting x-coordinate of the new subpath.
 * @param y the starting y-coordinate of the new subpath.
 * @return this path.
 */
Path.prototype.moveTo = function(x, y) {
  this.segments().add(new Path.Segment(Path.SEG_MOVE, [ new Vector(x, y) ]));
  return this;
};

/**
 * Connects the last point in the subpath to the given point (<i>x</i>,
 * <i>y</i>) using a straight line, and then adds the given point (<i>x</i>,
 * <i>y</i>) to the subpath.
 *
 * @param x the x-coordinate of the new point.
 * @param x the y-coordinate of the new point.
 * @return this path.
 */
Path.prototype.lineTo = function(x, y) {
  this.segments().add(new Path.Segment(Path.SEG_LINE, [ new Vector(x, y) ]));
  return this;
};

/**
 * Connects the last point in the subpath to the given point (<i>x</i>,
 * <i>y</i>) using a cubic Bezier curve with control points (<i>cp1x</i>,
 * <i>cp1y</i>) and (<i>cp2x</i>, <i>cp2y</i>). Then it adds the given point
 * (<i>x</i>, <i>y</i>) to the subpath.
 *
 * @return this path.
 * @param x the x-coordinate of the new point.
 * @param x the y-coordinate of the new point.
 */
Path.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
  this.segments().add(new Path.Segment(Path.SEG_BEZIER, [
      new Vector(x, y),
      new Vector(cp1x, cp1y),
      new Vector(cp2x, cp2y)
    ]));
  return this;
};

/**
 * Returns true if this path intersects the specified path. For {@code SEG_LINE}
 * segments, a simple line intersection test is performed. For {@code SEG_CURVE}
 * segments, the curve is flattened using recursive subdivision to produce a
 * series of connected line segments; these line segments are then tested for
 * intersection. The optional {@code flatness} parameter controls the accuracy
 * of the recursive subdivision.
 *
 * @param path the path to test for intersection with this path.
 * @param flatness distance threshold for curve subdivision; optional.
 */
Path.prototype.intersects = function(path, flatness) {
  var a = this._clone().flatten(flatness)._segments;
  var b = path._clone().flatten(flatness)._segments;
  for (var i = 0; i < a.length; i++) {
    if (a[i].type != Path.SEG_LINE) {
      continue;
    }
    var p1 = a[i - 1].points[0];
    var p2 = a[i].points[0];
    for (var j = 0; j < b.length; j++) {
      if (b[j].type != Path.SEG_LINE) {
        continue;
      }
      var q1 = b[j - 1].points[0];
      var q2 = b[j].points[0];
      if (Line.intersect(p1, p2, q1, q2)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Transforms this path, applying the specifed affine transform to every point
 * associated with every segment.
 *
 * @param affine the transform to apply to this path.
 * @return this path.
 */
Path.prototype.transform = function(affine) {
  var segments = this.segments();
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    for (var j = 0; j < segment.points.length; j++) {
      segment.points[j] = affine.transform(segment.points[j]);
    }
  }
  return this;
};

/**
 * Returns true if this path is flat, i.e., it contains no {@code SEG_BEZIER}
 * segments.
 */
Path.prototype.flat = function() {
  var segments = this.segments();
  for (var i = 0; i < segments.length; i++) {
    if (segments[i].type == Path.SEG_BEZIER) {
      return false;
    }
  }
  return true;
};

/**
 * Flattens this path, recursively subdividing an {@code SEG_BEZIER} segments
 * into {@code SEG_LINE} segments. If the optional flatness parameter is
 * specified, it serves as a distance threshold for curve subdivision.
 *
 * @param flatness distance threshold for curve subdivision; optional.
 * @return this path.
 */
Path.prototype.flatten = function(flatness) {
  var that = this;

  if (this.flat()) {
    return this;
  }
  if (!flatness) {
    flatness = 1;
  }

  /** Recursively subdivides the bezier curve {a, b, c, d}. */
  function addCurve(a, b, c, d) {
    var line = new Line(a.x, a.y, d.x, d.y);
    if ((line.distance(b.x, b.y) <= flatness)
        && (line.distance(c.x, c.y) <= flatness)) {
      that.lineTo(d.x, d.y);
    } else {
      var al = a;
      var bl = Path._weightCurve(Path._bezierLeft[1], a, b, c, d);
      var cl = Path._weightCurve(Path._bezierLeft[2], a, b, c, d);
      var dl = Path._weightCurve(Path._bezierLeft[3], a, b, c, d);
      addCurve(al, bl, cl, dl);
      var ar = dl;
      var br = Path._weightCurve(Path._bezierRight[1], a, b, c, d);
      var cr = Path._weightCurve(Path._bezierRight[2], a, b, c, d);
      var dr = d;
      addCurve(ar, br, cr, dr);
    }
  }

  var segments = this.segments();
  this._segments = [];
  for (var i = 0; i < segments.length; i++) {
    var s = segments[i];
    switch (s.type) {
      case Path.SEG_BEZIER: {
        var p = segments[i - 1];
        addCurve(p.points[0], s.points[1], s.points[2], s.points[0]);
        break;
      }
      default: {
        this._segments.add(s);
        break;
      }
    }
  }

  return this;
};

/**
 * Splits this path into <i>n</i> equal-length subpaths. For {@code SEG_LINE}
 * segments, line segments are subdivided using point interpolation. For {@code
 * SEG_CURVE} segments, the curve is flattened using recursive subdivision to
 * produce a series of connected line segments; these line segments are then
 * used for splitting. The optional {@code flatness} parameter controls the
 * accuracy of the recursive subdivision.
 *
 * @param n the number of subpaths to return.
 * @param flatness distance threshold for curve subdivision; optional.
 * @return an array of <i>n</i> subpaths.
 */
Path.prototype.split = function(n, flatness) {
  var segments = this._clone().flatten(flatness)._segments;

  /** Interpolates between points <i>p0</i> and <i>p1</i>. */
  function interpolate(p0, p1, t) {
    return new Vector(
        p0.x * (1 - t) + p1.x * t,
        p0.y * (1 - t) + p1.y * t);
  }

  /* Compute the relative length of each segment. */
  var sum = 0;
  var lengths = new Array(segments.length);
  lengths[0] = 0;
  for (var i = 1; i < segments.length; i++) {
    var p0 = segments[i - 1].points[0];
    var p1 = segments[i].points[0];
    lengths[i] = sum += p0.distance(p1.x, p1.y);
  }
  for (var i = 1; i < segments.length; i++) {
    lengths[i] /= sum;
  }

  /* Compute the subdivided paths. */
  var paths = new Array(n);
  var p0 = segments[0].points[0], p = p0;
  for (var i = 0, j = 1; i < n; i++) {
    var path = new Path().moveTo(p.x, p.y);
    var t1 = (i + 1) / n;
    while (lengths[j] < t1) {
      p0 = segments[j++].points[0];
      path.lineTo(p0.x, p0.y);
    }
    var p1 = segments[j].points[0];
    if (lengths[j] == t1) {
      p0 = segments[j++].points[0];
      p = p1;
    } else {
      var t = (t1 - lengths[j - 1]) / (lengths[j] - lengths[j - 1]);
      p = interpolate(p0, p1, t);
    }
    path.lineTo(p.x, p.y);
    paths[i] = path;
  }

  return paths;
};

/**
 * Empties the list of subpaths.
 *
 * @return this path.
 */
Path.prototype.clear = function() {
  this.segments().clear();
  return this;
};

/** Returns a shallow copy of the specified path. */
Path.prototype._clone = function(path) {
  var clone = new Path();
  clone._segments = this.segments();
  return clone;
}

/**
 * Returns the point that is the weighted sum of the specified control points,
 * using the specified weights. This method requires that there are four weights
 * and four control points.
 *
 * @param p1 the first control point.
 * @param p2 the second control point.
 * @param p3 the third control point.
 * @param p4 the fourth control point.
 */
Path._weightCurve = function(w, p1, p2, p3, p4) {
  return new Vector(
      w[0] * p1.x + w[1] * p2.x + w[2] * p3.x + w[3] * p4.x,
      w[0] * p1.y + w[1] * p2.y + w[2] * p3.y + w[3] * p4.y);
};

/** Matrix to subdivide bezier control points. Derived from FvD 11.2.7. */
Path._bezierLeft = [
  [ 8.0/8.0, 0.0/8.0, 0.0/8.0, 0.0/8.0 ],
  [ 4.0/8.0, 4.0/8.0, 0.0/8.0, 0.0/8.0 ],
  [ 2.0/8.0, 4.0/8.0, 2.0/8.0, 0.0/8.0 ],
  [ 1.0/8.0, 3.0/8.0, 3.0/8.0, 1.0/8.0 ]
];

/** Matrix to subdivide bezier control points. Derived from FvD 11.2.7. */
Path._bezierRight = [
  [ 1.0/8.0, 3.0/8.0, 3.0/8.0, 1.0/8.0 ],
  [ 0.0/8.0, 2.0/8.0, 4.0/8.0, 2.0/8.0 ],
  [ 0.0/8.0, 0.0/8.0, 4.0/8.0, 4.0/8.0 ],
  [ 0.0/8.0, 0.0/8.0, 0.0/8.0, 8.0/8.0 ]
];
