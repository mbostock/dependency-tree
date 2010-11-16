/**
 * Implements hierarchical edge bundling using Holten's algorithm. For each
 * edge, an open uniform b-spline is computed that travels through the tree, up
 * the parent hierarchy to the least common ancestor, and then back down to the
 * destination node.
 *
 * <p>The behavior of the router can be customized by overriding the {@link
 * #drawSpline} and {@link #transformPoint} methods. The default implementation
 * of these methods is documented below.
 *
 * @param tree a tree.
 * @param layout a layout, defining position.
 */
function BundledEdgeRouter(tree, layout) {
  this.beta = 0.85;
  this.tree = tree;
  this.layout = layout;
  this.splines = null;
}

/**
 * Returns the edge spline between nodes <i>i</i> and <i>j</i>. 
 *
 * @param i the index of the start node.
 * @param j the index of the end node.
 */
BundledEdgeRouter.prototype._spline = function(i, j) {
  var start = this.tree.nodes[i], end = this.tree.nodes[j];
  var lca = this.tree.leastCommonAncestor(start, end);
  var points = [];
  points.add(this.transformPoint(this.layout.position(i)));
  while (start != lca) {
    start = start.parent;
    points.add(this.transformPoint(this.layout.position(start.index)));
  }
  var k = points.size();
  while (end != lca) {
    points.add(k, this.transformPoint(this.layout.position(end.index)));
    end = end.parent;
  }
  var s = new BasisSpline().addAll(points).straighten(this.beta);
  s._start = i;
  s._end = j;
  return s;
};

/**
 * Initializes the edge router, computing the splines. This method can be called
 * multiple times to recompute the splines if the tree or layout changes.
 */
BundledEdgeRouter.prototype.init = function() {
  this.splines = [];
  for (var i = 0; i < this.tree.nodes.length; i++) {
    for (var j = 0; j < this.tree.nodes[i].outgoing.length; j++) {
      this.splines.add(this._spline(i, this.tree.nodes[i].outgoing[j].index));
    }
  }
};

/**
 * Draws the edges into the specified context.
 *
 * @param context the canvas element context.
 */
BundledEdgeRouter.prototype.draw = function(context) {
  for (var i = 0; i < this.splines.length; i++) {
    this.drawSpline(context, i);
  }
};

/**
 * Draws the specified spline into the specified graphics context. This method
 * should be reassigned to apply custom styles to splines. The default
 * implementation is simply to stroke the specified spline.
 *
 * @param context the canvas context in which to draw.
 * @param i the index of the spline to draw.
 * @see Path#stroke
 */
BundledEdgeRouter.prototype.drawSpline = function(context, i) {
  this.splines[i].stroke(context);
};

/**
 * Returns the transformed control point. The default implementation is to
 * return the specified point, untransformed.
 *
 * @param point the point to transform.
 */
BundledEdgeRouter.prototype.transformPoint = function(point) {
  return point;
};
