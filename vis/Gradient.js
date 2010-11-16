/**
 * Represents a simple linear gradient between the specified <i>start</i> and
 * <i>end</i> color. The linear interpolation is performed in RGB space; the
 * specified colors are converted to RGB if they are not so already.
 *
 * @param start the start color.
 * @param end the end color.
 */
function Gradient(start, end) {
  this.start = start.rgb();
  this.end = end.rgb();
}

/**
 * Returns the color value at the specified parameter <i>t</i>, in [0, 1]. The
 * returned color is in RGB space.
 *
 * @param t the parameter value, in [0, 1].
 */
Gradient.prototype.color = function(t) {
  return new Color.Rgb(
      Math.round(this.start.r * (1 - t) + this.end.r * t),
      Math.round(this.start.g * (1 - t) + this.end.g * t),
      Math.round(this.start.b * (1 - t) + this.end.b * t),
      this.start.a * (1 - t) + this.end.a * t);
};
