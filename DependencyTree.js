/**
 * Represents a directed graph of classes, organized hierarchically by package
 * structure, with edges corresponding to dependencies. Class names are assumed
 * to be fully-qualified per Java convention, with package names separated by
 * periods ("."). For example, the class {@code flare.util.Arrays} is the class
 * {@code Arrays} in the package {@code flare}, subpackage {@code util}.
 *
 * <p>Although it is possible to add nodes directly using the {@link Tree} API,
 * typically classes are added via the {@link #get} method, which constructs the
 * necessary parent nodes representing the packages as needed.
 *
 * <p>The root node of the tree does not have an associated {@code name} field.
 * All other nodes in the tree use the {@code name} attribute to store the
 * <i>short</i> name of the class (e.g., "Arrays").
 */
function DependencyTree() {
  Tree.call(this);
  this._map = {};
}
DependencyTree.prototype = Tree.extend();

/**
 * Returns the node for the class with the specified name. The name must be
 * fully-qualified, e.g., "flare.util.Arrays". This method creates the
 * appropriate nodes for the specified class and all parent classes for the
 * associated package as needed.
 *
 * @param name a fully-qualified class name.
 */
DependencyTree.prototype.get = function(name) {
  if (this._map[name]) {
    return this._map[name];
  }
  var i = name.lastIndexOf(".");
  var parent = (i == -1) ? this.root : this.get(name.substring(0, i));
  var node = parent.addChild();
  node.name = name.substring(i + 1);
  node.fullName = name;
  this._map[name] = node;
  return node;
};
