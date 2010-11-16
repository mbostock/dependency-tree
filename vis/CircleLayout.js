/**
 * Given a {@link Tree}, computes a circular layout of the tree nodes. Each
 * concentric ring of the circle corresponds to a given depth in the tree
 * hierarchy. Internal nodes are positioned such that leaf nodes are equally
 * spaced on the perimeter in terms of angle; note however that because leaves
 * can be at different depths, they may be at different cartesian distances from
 * each other.
 *
 * <p>The layout algorithm can be customized by specifying the {@code
 * startAngle} and {@code endAngle}. In addition, the {@code startRadius} can be
 * specified such that the first (non-trivial) ring is placed farther out from
 * the center. After all the desired parameters have been specified, call {@link
 * #init} to initialize the layout.
 *
 * <p>This layout algorithm uses the space [-1, 1] in x and y. To transform this
 * space into suitable coordinates for rendering, use an {@link
 * AffineTransform}.
 */
function CircleLayout(tree) {
  this.endAngle = 2.0 * Math.PI;
  this.startAngle = 0.0;
  this.startRadius = 0.0;
  this.tree = tree;
}

/**
 * Initializes the layout. This method can be called multiple times to recompute
 * the layout if the tree changes, or if layout parameters have been changed.
 */
CircleLayout.prototype.init = function() {
  this._positions = [];
  this._angles = [];

  var that = this;
  var countByNode = new Array(this.tree.nodes.length);
  var depthByNode = new Array(this.tree.nodes.length);
  var maxDepth = 0;
  var radiuScale = 1.0;

  function count(node, depth) {
    if (depth > maxDepth) {
      maxDepth = depth;
    }
    depthByNode[node.index] = depth;
    if ((depth > 0) || (node.children.length > 1)) {
      depth++;
    }
    var sum = (node.children.length == 0) ? 1 : 0;
    for (var i = 0; i < node.children.length; i++) {
      sum += count(node.children[i], depth);
    }
    if (sum == node.children.length) {
      sum++;
    }
    countByNode[node.index] = sum;
    return sum;
  }

  function order(children) {
    if (!that.sort) {
      return children;
    }
    children = children.clone();
    children.sort(that.sort);
    return children;
  }

  function placeAll(node, start, end) {
    place(node, (start + end) / 2.0);
    var step = (end - start) / countByNode[node.index];
    var children = order(node.children);
    for (var i = 0, k = 0; k < children.length; k++) {
      var j = i + countByNode[children[k].index];
      placeAll(children[k], start + i * step, start + j * step);
      i = j;
    }
  }

  function place(node, angle) {
    angle -= Math.PI / 2.0;
    var depth = depthByNode[node.index];
    var radius = (depth == 0) ? 0 : (that.startRadius + radiusScale * depth);
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;
    that._positions[node.index] = new Vector(x, y);
    that._angles[node.index] = angle;
  }

  count(this.tree.root, 0);
  radiusScale = (1.0 - this.startRadius) / maxDepth;
  placeAll(this.tree.root, this.startAngle, this.endAngle);
};

/**
 * Returns the position (a {@link Vector}) for the node with the specified
 * index.
 *
 * @param index a node index.
 */
CircleLayout.prototype.position = function(index) {
  return this._positions[index];
};

/**
 * Returns the angle (in radians) for the node with the specified index.
 *
 * @param index a node index.
 */
CircleLayout.prototype.angle = function(index) {
  return this._angles[index];
};

/**
 * Returns the polygon that contains all of the nodes positioned by this
 * layout. The returned polygon is not guaranteed to be the convex hull
 * containing the leaf nodes, but it is typically fairly close.
 */
CircleLayout.prototype.outline = function() {
  var that = this;

  /* Sort the nodes by angle. */
  var nodes = this.tree.nodes.clone();
  nodes.sort(function(a, b) {
      return that.angle(a.index) - that.angle(b.index);
    });

  /* Return the polygon that spans the leaf nodes. */
  var path = new Path();
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].children.length == 0) {
      var p = this.position(nodes[i].index);
      if (path.segments().length == 0) {
        path.moveTo(p.x, p.y);
      } else {
        path.lineTo(p.x, p.y);
      }
    }
  }

  return path;
};
