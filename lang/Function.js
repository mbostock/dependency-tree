/**
 * Used to assign a prototype to a child class. For example:
 *
 * <pre>Child.prototype = Parent.extend();</pre>
 *
 * This way, the Child inherits attributes from the Parent's prototype, without
 * creating a shared Parent instance. Don't forget to call Parent.call(this,
 * ...) in the constructor!
 */
Function.prototype.extend = function() {
  function f() {}
  f.prototype = this.prototype;
  return new f();
};
