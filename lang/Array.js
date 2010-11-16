/** Returns the size of this array. Equivalent to {@code length}. */
Array.prototype.size = function() {
  return this.length;
};

/** Returns true if this array contrains the specified element. */
Array.prototype.contains = function(element) {
  return this.indexOf(element) != -1;
};

/** Returns true if this array contains all of the specified elements. */
Array.prototype.containsAll = function(elements) {
  for (var i = 0; i < elements.length; i++) {
    if (!this.contains(elements[i])) {
      return false;
    }
  }
  return true;
};

/** Returns true if this array is empty. */
Array.prototype.isEmpty = function() {
  return this.length == 0;
};

/** Returns a shallow copy of this array. */
Array.prototype.clone = function() {
  var clone = new Array(this.length);
  for (var i = 0; i < this.length; i++) {
    clone[i] = this[i];
  }
  return clone;
};

/** Clears this array, setting the length to zero. */
Array.prototype.clear = function() {
  this.length = 0;
};

/** Adds the specified element to the end of this array. */
Array.prototype.add = function(index, element) {
  if (arguments.length == 2) {
    this.splice(index, 0, element);
  } else {
    this.push(index);
  }
};

/** Adds all of the specified elements to the end of this array. */
Array.prototype.addAll = function(index, elements) {
  if (arguments.length == 2) {
    var n = this.length, m = elements.length;
    this.length += m;
    for (var i = n - 1; i >= index; i--) {
      this[i + m] = this[i];
    }
    for (var i = 0; i < m; i++) {
      this[i + index] = elements[i];
    }
  } else {
    for (var i = 0; i < index.length; i++) {
      this.push(index[i]);
    }
  }
};

/**
 * Removes the specified element from this array, if it exists.
 *
 * @param element the element to remove.
 * @return true if the element was removed; otherwise false.
 */
Array.prototype.remove = function(element) {
  var i = this.indexOf(element);
  if (i != -1) {
    this.splice(i, 1);
    return true;
  }
  return false;
};

/** Removes all of the specified elements from this array. */
Array.prototype.removeAll = function(elements) {
  for (var i = 0; i < elements.length; i++) {
    this.remove(elements[i]);
  }
};

/** Retains only the specified elements in this array. */
Array.prototype.retainAll = function(elements) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (!elements.contains(this[i])) {
      this.splice(i, 1);
    }
  }
};
