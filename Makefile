JS_FILES = \
	lang/Function.js \
	lang/Array.js \
	lang/Canvas.js \
	data/Tree.js \
	geom/Vector.js \
	geom/Path.js \
	geom/AffineTransform.js \
	geom/BasisSpline.js \
	geom/Circle.js \
	geom/Line.js \
	geom/Rectangle.js \
	vis/BundledEdgeRouter.js \
	vis/CircleLayout.js \
	vis/Color.js \
	vis/Gradient.js \
	vis/RadialLabeler.js \
	DependencyTree.js \
	DependencyTreeControl.js

RSRC_FILES = \
	Makefile \
	dependency-data.js \
	dependency-tree.html \
	dependency-tree.js

dependency-tree.js: $(JS_FILES) Makefile
	cat $(JS_FILES) | java -jar lib/yuicompressor-2.4.2.jar --type js > $@

dependency-tree.tar.gz: $(JS_FILES) $(RSRC_FILES)
	tar czvf $@ $^

clean:
	rm -f dependency-tree.js dependency-tree.zip
