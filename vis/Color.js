/** Represents a color. */
function Color() {}

/**
 * Represents a color in RGB space.
 *
 * @param r the red component, in [0, 255].
 * @param g the green component, in [0, 255].
 * @param b the blue component, in [0, 255].
 * @param a the alpha component, in [0, 1].
 */
Color.Rgb = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

/** Returns this color in RGB space. */
Color.Rgb.prototype.rgb = function() {
  return this;
};

/** Returns the string representation of this color. */
Color.Rgb.prototype.toString = function() {
  return "rgba("
      + this.r + ", "
      + this.g + ", "
      + this.b + ", "
      + this.a + ")";
};

Color.white = new Color.Rgb(255, 255, 255, 1);
Color.red = new Color.Rgb(255, 0, 0, 1);
Color.green = new Color.Rgb(0, 255, 0, 1);
Color.blue = new Color.Rgb(0, 0, 255, 1);
Color.black = new Color.Rgb(0, 0, 0, 1);
