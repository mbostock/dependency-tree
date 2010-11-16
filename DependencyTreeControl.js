/**
 * Reads the tree of classes and imports from {@code data}, and then constructs
 * an interactive visualization using a circle layout and bundled edges.
 *
 * @param canvas the canvas element in which to render the dependency tree.
 * @param legend the canvas element in which to render the legend.
 * @param label the div element in which to render the active label.
 */
function DependencyTreeControl(canvas, legend, label) {
  var g = canvas.getContext("2d");

  /* Create a back-buffer for rotating. */
  var b = document.createElement("canvas").getContext("2d");
  b.canvas.width = canvas.width;
  b.canvas.height = canvas.height;
  b.canvas.style.display = "none";
  document.body.appendChild(b.canvas);

  /* Convert the import data into a dependency tree. */
  var tree = new DependencyTree();
  for (var i = 0; i < data.length; i++) {
    var node = tree.get(data[i].name);
    for (var j = 0; j < data[i].imports.length; j++) {
      node.addEdge(tree.get(data[i].imports[j]));
    }
  }

  /* Construct the affine transform for the canvas. */
  var w = canvas.width, h = canvas.height, padding = 80;
  var angleOffset = 0.0;
  var affine = new AffineTransform()
      .translate(w / 2.0, h / 2.0)
      .scale(Math.min(w, h) / 2.0 - padding);

  /* Construct the circle layout for the tree, sorted by name. */
  var layout = new CircleLayout(tree);
  layout.startRadius = 0.6;
  layout.sort = function(a, b) {
      return (a.name == b.name) ? 0 : ((a.name > b.name) ? 1 : -1);
    };
  layout.init();

  /* Construct the radial node labeler. */
  var labels = new RadialLabeler(tree, layout);
  labels.transformAngle = function(a) { return a + angleOffset; };
  labels.transformPoint = function(p) { return affine.transform(p); };
  labels.name = function(node) { return node.name; };
  labels.style = function(node) { return node._style; };

  /* Construct the bundled edge router. */
  var edges = new BundledEdgeRouter(tree, layout);
  edges.transformPoint = function(p) { return affine.transform(p); };
  edges.init();

  /* Define a custom draw method for the edges using a gradient. */
  var colors = DependencyTreeControl._light;
  var gradient = new Gradient(colors.edgeStart, colors.edgeEnd);
  var gradientAlpha = 1;
  var gradientSteps = 8;
  var gradientPaths = new Array(edges.splines.length);
  for (var i = 0; i < gradientPaths.length; i++) {
    gradientPaths[i] = edges.splines[i].flatten().split(gradientSteps);
  }
  edges.draw = function(g) {
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(angleOffset);
      g.translate(-w / 2, -h / 2);
      g.globalCompositeOperation = colors.edgeComposite;
      g.strokeStyle = colors.edgeInactive;
      for (var j = 0; j < this.splines.length; j++) {
        var e = this.splines[j];
        if (!e._active) {
          e.stroke(g);
        }
      }
      for (var i = 0, n = gradientSteps; i < n; i++) {
        var c = gradient.color((i + .5) / n);
        c.a = gradientAlpha;
        g.strokeStyle = c.toString();
        for (var j = 0; j < this.splines.length; j++) {
          if (this.splines[j]._active) {
            gradientPaths[j][i].stroke(g);
          }
        }
      }
      g.restore();
    };

  /** Compute the intersections. */
  function updateIntersect() {
    var inc = new Array(tree.nodes.length);
    var out = new Array(tree.nodes.length);
    for (var i = 0; i < tree.nodes.length; i++) {
      inc[i] = out[i] = 0;
    }
    var activeCount = 0;

    /* Transform the intersection line into edge space. */
    var ix;
    if (intersect != null) {
      ix = new Line(
          intersect.start().x, intersect.start().y,
          intersect.end().x, intersect.end().y)
          .transform(new AffineTransform()
              .translate(w / 2.0, h / 2.0)
              .rotate(angleOffset)
              .translate(-w / 2.0, -h / 2.0));
    }

    /* Compute the number of active incoming and outgoing edges. */
    for (var i = 0; i < edges.splines.length; i++) {
      var edge = edges.splines[i];
      edge._active = !ix || ix.intersects(edge);
      if (edge._active) {
        activeCount++;
        out[edge._start]++;
        inc[edge._end]++;
      }
    }

    /* Propagate the edge count to ancestors (yay heap order!). */
    for (var i = 0; i < tree.nodes.length; i++) {
      var parent = tree.nodes[i].parent;
      while (parent != null) {
        inc[parent.index] += inc[i];
        out[parent.index] += out[i];
        parent = parent.parent;
      }
    }

    gradientAlpha = .17 + .83 / Math.sqrt(activeCount);
    for (var i = 0; i < tree.nodes.length; i++) {
      tree.nodes[i]._style = ((inc[i] > 0) && (out[i] == 0))
          ? colors.labelEnd : (((out[i] > 0) && (inc[i] == 0))
             ? colors.labelStart : (((inc[i] + out[i]) > 0)
                 ? colors.labelActive
                 : colors.labelInactive));
    }
  }

  /** Compute the nearest node and display the full name. */
  function updateLabel(n) {
    n = n || label._node;
    label.style.color = n._style;
    label.innerHTML = n.fullName;
    label._node = n;
  }

  var OP_NONE = 0;
  var OP_ROTATE = 1;
  var OP_INTERSECT = 2;

  var outline = layout.outline().transform(affine);
  var operation = OP_NONE;
  var deltaAngle = 0.0;
  var click = null;
  var intersect = null;

  /* On mousedown, copy the current canvas into the backbuffer. */
  window.addEventListener("mousedown", function(e) {
      if (e.button != 0) return;
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      click = new Vector(x, y);
      b.clearRect(0, 0, w, h);
      b.drawImage(canvas, 0, 0, w, h);
      if (outline.contains(g, x, y)) {
        operation = OP_INTERSECT;
        if (intersect != null) {
          var s = intersect.start(), e = intersect.end();
          if (click.distance(s.x, s.y) < 4) {
            click = e;
            document.body.style.cursor = "-moz-grabbing";
          } else if (click.distance(e.x, e.y) < 4) {
            click = s;
            document.body.style.cursor = "-moz-grabbing";
          }
        }
        return;
      }
      document.body.style.cursor = "-moz-grabbing";
      operation = OP_ROTATE;
      deltaAngle = 0.0;
    }, false);

  /* Then, on mousemove, we can render the rotated image quickly. */
  window.addEventListener("mousemove", function(e) {
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      switch (operation) {
        case OP_NONE: {
          updateLabel(labels.nodeAt(x, y));

          /* Check if the cursor is near the intersect end points. */
          if (intersect != null) {
            var s = intersect.start(), e = intersect.end();
            var xy = new Vector(x, y);
            if ((xy.distance(s.x, s.y) < 4) || (xy.distance(e.x, e.y) < 4)) {
              document.body.style.cursor = "-moz-grab";
              break;
            }
          }

          document.body.style.cursor = outline.contains(g, x, y)
              ? "crosshair" : "-moz-grab";
          break;
        }
        case OP_INTERSECT: {
          g.clearRect(0, 0, w, h);
          g.drawImage(b.canvas, 0, 0, w, h);
          intersect = new Line(click.x, click.y, x, y);
          drawIntersect();
          break;
        }
        case OP_ROTATE: {
          var p = new Vector(x - w / 2, y - h / 2);
          var q = new Vector(click.x - w / 2, click.y - h / 2);
          deltaAngle = Math.atan2(q.cross(p), q.dot(p));
          g.clearRect(0, 0, w, h);
          g.save();
          g.translate(w / 2, h / 2);
          g.rotate(deltaAngle);
          g.translate(-w / 2, -h / 2);
          g.drawImage(b.canvas, 0, 0, w, h);
          g.restore();
          break;
        }
      }
    }, false);

  /* On mouseup, recalculate the layout. */
  window.addEventListener("mouseup", function(e) {
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;
      switch (operation) {
        case OP_INTERSECT: {
          if (click.distance(x, y) < 3) {
            intersect = null;
          }
          updateIntersect();
          redraw();
          break;
        }
        case OP_ROTATE: {
          angleOffset += deltaAngle;
          if (intersect != null) {
            intersect.transform(new AffineTransform()
                .translate(w / 2.0, h / 2.0)
                .rotate(-deltaAngle)
                .translate(-w / 2.0, -h / 2.0));
          }
          affine = new AffineTransform()
              .translate(w / 2.0, h / 2.0)
              .scale(Math.min(w, h) / 2.0 - padding)
              .rotate(-angleOffset);
          outline = layout.outline().transform(affine);
          redraw();
          break;
        }
      }
      document.body.style.cursor = "auto";
      operation = OP_NONE;
    }, false);

  /* On 'i' toggle the background color. */
  window.addEventListener("keydown", function(e) {
      if (operation != OP_NONE) return;
      switch (e.keyCode) {
        case 73: {
          colors = colors.next;
          gradient.start = colors.edgeStart;
          gradient.end = colors.edgeEnd;
          updateIntersect(); // caches colors
          updateLabel();
          redraw();
          break;
        }
      }
    }, false);

  /** Draw the intersect line. */
  function drawIntersect() {
    if (!intersect) return;
    g.strokeStyle = colors.intersectStroke;
    g.fillStyle = colors.intersectFill;
    intersect.stroke(g);
    new Circle(intersect.start().x, intersect.start().y, 2.5).fill(g).stroke(g);
    new Circle(intersect.end().x, intersect.end().y, 2.5).fill(g).stroke(g);
  }

  /** Draw the legend. */
  function drawLegend() {
    var l = legend.getContext("2d");
    var w = l.canvas.width, h = l.canvas.height;
    l.clearRect(0, 0, w, h);

    var p = l.createLinearGradient(20, 0, w - 20, 0);
    p.addColorStop(0, gradient.start.toString());
    p.addColorStop(1, gradient.end.toString());
    l.fillStyle = p;
    l.fillRect(20, 13, w - 35, 2);

    l.font = "7pt Sans-Serif";
    l.fillStyle = colors.labelStart;
    l.fillText("A", 10, 17);
    l.fillStyle = colors.labelEnd;
    l.fillText("B", w - 12, 17);

    var s = "depends on";
    var tw = l.measureText(s).width;
    l.fillStyle = colors.intersectStroke;
    l.fillText(s, (w - tw) / 2, 10);
  }

  /** Draw the nodes and edges! */
  function redraw() {
    document.body.style.background = colors.background;
    g.clearRect(0, 0, w, h);
    edges.draw(g);
    drawIntersect();
    labels.draw(g);
    drawLegend();
  }

  /** Initializes the demo. */
  this.init = function() {
    g.font = "6pt Sans-Serif";
    updateIntersect();
    redraw();
  };
}

/** White background. */
DependencyTreeControl._light = {
   background : "white",
   edgeComposite : "darker",
   edgeStart : Color.green,
   edgeEnd : Color.red,
   edgeInactive : "rgba(0, 0, 0, .02)",
   labelStart : "rgb(0, 128, 0)",
   labelEnd : "rgb(128, 0, 0)",
   labelActive : "black",
   labelInactive : "rgba(0, 0, 0, .2)",
   intersectStroke : "black",
   intersectFill : "white",
};

/** Black background. */
DependencyTreeControl._dark = {
   background : "black",
   edgeComposite : "lighter",
   edgeStart : Color.green,
   edgeEnd : Color.red,
   edgeInactive : "rgba(192, 192, 192, .02)",
   labelStart : "rgb(0, 192, 0)",
   labelEnd : "rgb(192, 0, 0)",
   labelActive : "rgb(192, 192, 192)",
   labelInactive : "rgba(192, 192, 192, .2)",
   intersectStroke : "white",
   intersectFill : "black",
};

/** White background. */
DependencyTreeControl._alt = {
   background : "white",
   edgeComposite : "darker",
   edgeStart : new Color.Rgb(28, 0, 252, 1),
   edgeEnd : new Color.Rgb(249, 128, 22, 1),
   edgeInactive : "rgba(0, 0, 0, .02)",
   labelStart : "rgb(28, 0, 252)",
   labelEnd : "rgb(176, 91, 16)",
   labelActive : "black",
   labelInactive : "rgba(0, 0, 0, .2)",
   intersectStroke : "black",
   intersectFill : "white",
};

/** Black background. */
DependencyTreeControl._altDark = {
   background : "black",
   edgeComposite : "lighter",
   edgeStart : new Color.Rgb(53, 0, 252, 1),
   edgeEnd : new Color.Rgb(249, 128, 22, 1),
   edgeInactive : "rgba(192, 192, 192, .02)",
   labelStart : "rgb(64, 0, 255)",
   labelEnd : "rgb(176, 91, 16)",
   labelActive : "rgb(192, 192, 192)",
   labelInactive : "rgba(192, 192, 192, .2)",
   intersectStroke : "white",
   intersectFill : "black",
};

/** Monochrome. */
DependencyTreeControl._mono = {
   background : "rgb(128, 128, 128)",
   edgeComposite : "source-over",
   edgeStart : Color.white,
   edgeEnd : Color.black,
   edgeInactive : "rgba(0, 0, 0, .02)",
   labelStart : "white",
   labelEnd : "black",
   labelActive : "#333333",
   labelInactive : "rgba(0, 0, 0, .2)",
   intersectStroke : "black",
   intersectFill : "white",
};

DependencyTreeControl._light.next = DependencyTreeControl._dark;
DependencyTreeControl._dark.next = DependencyTreeControl._alt;
DependencyTreeControl._alt.next = DependencyTreeControl._altDark;
DependencyTreeControl._altDark.next = DependencyTreeControl._mono;
DependencyTreeControl._mono.next = DependencyTreeControl._light;
