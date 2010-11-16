/**
 * Represents a directed tree graph using an adjacency list, for more convenient
 * access to the edges for a given vertex. Each vertex is represented by the
 * {@code Node} interface, which provides methods for viewing the collection of
 * outgoing and incoming edges.
 *
 * <p>This class maintains heap ordering of nodes, such that parents are
 * guaranteed to have an earlier index from their children. When the tree is
 * initially constructed, it has a single root node with no edges; this root
 * node cannot be removed.
 */
function Tree() {
  this.clear();
}

/** Represents a vertex in a tree. */
Tree._Node = function(tree, parent) {
  this.outgoing = [];
  this.incoming = [];
  this.children = [];
  this.tree = tree;
  this.index = tree.nodes.length;
  this.parent = parent;
  tree.nodes.add(this);
};

/**
 * Adds a new child node to this node. The new child node has its parent set to
 * this node, and likewise the parent's children array is expanded to include
 * the new child node. The new child node initially has no edges.
 *
 * @return the new child node.
 */
Tree._Node.prototype.addChild = function() {
  var child = new Tree._Node(this.tree, this);
  this.children.add(child);
  return child;
};

/**
 * Removes the specified child node. The child node must be a child of this
 * node. All edges to the specified child are removed, as well as any
 * grandchildren.
 */
Tree._Node.prototype.removeChild = function(child) {
  this.children.remove(child);
  child.clearEdges();
  child.clearChildren();
  this.tree.nodes.splice(child.index, 1);
  for (var i = child.index, n = this.tree.nodes.length; i < n; i++) {
    this.tree.nodes[i].index = i;
  }
};

/** Removes all the children of this node. */
Tree._Node.prototype.clearChildren = function() {
  for (var i = 0; i < this.children.length; i++) {
    this.removeChild(this.children[i]);
  }
};

/**
 * Adds a directed edge from this node to the specified node.
 *
 * @param node the end node of the new edge.
 */
Tree._Node.prototype.addEdge = function(node) {
  node.incoming.push(this);
  this.outgoing.push(node);
};

/**
 * Removes a directed edge from this node to the specified node, if such an edge
 * exists. Otherwise, this method does nothing.
 *
 * @param node the end of node of the edge to remove.
 * @return true if the edge was removed; otherwise false.
 */
Tree._Node.prototype.removeEdge = function(node) {
  if (node.incoming.remove(this)) {
    this.outgoing.remove(node);
    return true;
  }
  return false;
};

/**
 * Clears all of the edges associated with this node. This method does not
 * affect parent-child relationships.
 */
Tree._Node.prototype.clearEdges = function() {
  for (var i = 0; i < this.incoming.length; i++) {
    this.incoming[i].outgoing.remove(this);
  }
  for (var i = 0; i < this.outgoing.length; i++) {
    this.outgoing[i].incoming.remove(this);
  }
  this.incoming = [];
  this.outgoing = [];
};

/**
 * Returns the list of ancestor nodes for this tree node. The returned array
 * starts with this node and then continues up parent edges until it reaches the
 * tree root.
 */
Tree._Node.prototype.ancestors = function() {
  var ancestors = [];
  var node = this, parent = this.parent;
  while (parent != null) {
    ancestors.add(node);
    node = parent;
    parent = parent.parent;
  }
  ancestors.add(node);
  return ancestors;
};

/**
 * Clears this tree, removing all nodes. The resultant tree has a single root
 * node with no edges. Any references to tree nodes that are persist after this
 * call to clear are invalidated; their behavior is undefined.
 */
Tree.prototype.clear = function() {
  this.nodes = [];
  this.root = new Tree._Node(this, null);
};

/**
 * Returns the least common ancestor for nodes <i>a</i> and <i>b</i>. The two
 * nodes must be from this tree; otherwise, the behavior of this method is
 * undefined.
 *
 * @param a a node.
 * @param b another node, possibly the same.
 */
Tree.prototype.leastCommonAncestor = function(a, b) {
  if (a == b) {
    return a;
  }
  var aNodes = a.ancestors();
  var bNodes = b.ancestors();
  var aNode = aNodes.pop();
  var bNode = bNodes.pop();
  var sharedNode = null;
  while (aNode == bNode) {
    sharedNode = aNode;
    aNode = aNodes.pop();
    bNode = bNodes.pop();
  }
  return sharedNode;
};
