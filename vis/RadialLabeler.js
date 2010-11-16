/**
 * Implements a radial labeler for a given {@link Tree} and {@link
 * CircleLayout}. For each leaf node in the tree, this labeler renders the name
 * of the node at the layout-specified position, rotated to match the
 * layout-specified angle.
 *
 * <p>The behavior of the labeler can be customized by overriding the {@link
 * #name}, {@link #transformPoint} and {@link #transformAngle} methods. The
 * default implementation of these methods is documented below.
 *
 * @param tree a tree.
 * @param layout a circle layout, defining both position and angle.
 */
function RadialLabeler(tree, layout) {
  this.tree = tree;
  this.layout = layout;
}

/** Draws the node <i>i</i>. */
RadialLabeler.prototype._drawNode = function(context, i) {
  var p = this.transformPoint(this.layout.position(i));
  context.save();
  context.translate(p.x, p.y);
  context.fillStyle = this.style(this.tree.nodes[i]) || context.fillStyle;
  var a = this.transformAngle(this.layout.angle(i));
  var n = this.name(this.tree.nodes[i]);
  if (this._upsideDown(a)) {
    /* context.textAlign = "right" requires Firefox 3.1 */
    context.rotate(a + Math.PI);
    context.fillText(n, -context.measureText(n).width - 2, 2);
  } else {
    context.rotate(a);
    context.fillText(n, 2, 2);
  }
  context.restore();
};

/** Returns true if the specified angle would render text upside-down. */
RadialLabeler.prototype._upsideDown = function(angle) {
  angle %= 2.0 * Math.PI;
  if (angle < 0) {
    angle += 2.0 * Math.PI;
  }
  return (angle > Math.PI / 2.0) && (angle < 1.5 * Math.PI);
};

/**
 * Draws the labels for the leaf nodes into the specified context.
 *
 * @param context the canvas element context.
 */
RadialLabeler.prototype.draw = function(context) {
  if (!context.fillText) { // requires Firefox 3.1 beta
    return;
  }
  for (var i = 0; i < this.tree.nodes.length; i++) {
    if (this.tree.nodes[i].children.length == 0) {
      this._drawNode(context, i);
    }
  }
};

/**
 * Returns the name for the specified tree node. The default implementation
 * returns the index.
 *
 * @param node a tree node.
 */
RadialLabeler.prototype.name = function(node) {
  return node.index;
};

/**
 * Returns the fill style to use for the specified label, or null if the
 * default fill style should be used. This method should be reassigned to
 * apply custom styles to labels.
 *
 * @param node the node for which to apply a style.
 */
RadialLabeler.prototype.style = function(node) {
  return null;
};

/**
 * Returns the transform of the specified layout point. If an {@link
 * AffineTransform} is used to transform the layout for display in the canvas,
 * this method should be reassigned to apply the equivalent transformation to
 * the label positions.
 *
 * @param point a layout position.
 */
RadialLabeler.prototype.transformPoint = function(point) {
  return point;
};

/**
 * Returns the transform of the specified layout angle. If a rotation is used to
 * transform the layout for display in the canvas, this method should be
 * reassigned to apply the equivalent rotation to the label angles.
 *
 * @param angle a layout angle.
 */
RadialLabeler.prototype.transformAngle = function(angle) {
  return angle;
};

/**
 * Returns the tree node closest to the specified point (<i>x</i>, <i>y</i>).
 * Note that this may return an inner (non-leaf) node of the tree.
 *
 * @param x the x-coordinate of the point.
 * @param y the y-coordinate of the point.
 */
RadialLabeler.prototype.nodeAt = function(x, y) {
  var j = 0, jd = Infinity;
  for (var i = 1; i < this.tree.nodes.length; i++) {
    var p = this.transformPoint(this.layout.position(i));
    var pd = p.distance(x, y);
    if (pd < jd) {
      j = i;
      jd = pd;
    }
  }
  return this.tree.nodes[j];
};
