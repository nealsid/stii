"use strict";

function Croptasticr(parentNode, previewNode) {
  this.parentNode = parentNode;
  this.paper = null;
  this.viewportCenterX = null;
  this.viewportCenterY = null;
  this.width = null;
  this.height = null;
  // The inner viewport that is transparent
  this.viewportElement = null;
  // This is the Raphael set that contains the viewportElement as well
  // as the resize handles.  We put them in a set so that they move as
  // one element when the viewport is dragged by the user.
  this.viewportElementAndHandlesSet = null;
  this.lr_handle = null;
  // The outer element that is shaded, to indicate to users which
  // parts of the image aren't currently included.
  this.shadeElement = null;
  // The event handlers give window-relative coordinates, so store
  // the origin of the paper (in window-coordinates) to subtract from
  // event handler coordinates.
  this.xoffset = null;
  this.yoffset = null;

  if (previewNode.tagName.toLowerCase() != "canvas") {
    alert("Preview widget needs to be canvas");
  }

  // Preview-related object references
  this.previewNode = previewNode;
  // This stores a corresponding IMG DOM object for the IMAGE one that
  // Raphael creates (the Raphael one is SVG-specific).
  this.imageForRaphaelSVGImage = null;
  this.svgImage = null;
  this.drawingContext = null;
  this.widthMultiplier = null;
  this.heightMultiplier = null;
  this.sideLength = null;
};

Croptasticr.prototype.setup = function(pic_url) {
  this.paper = Raphael(this.parentNode);
  var boundingRect = this.parentNode.getBoundingClientRect();
  this.xoffset = boundingRect.left + window.scrollX;
  this.yoffset = boundingRect.top + window.scrollY;
  this.width = boundingRect.width;
  this.height = boundingRect.height;
  this.svgImage = this.paper.image(pic_url, 0, 0, this.width, this.height);

  this.viewportCenterX  = this.width / 2;
  this.viewportCenterY = this.height / 2;
  this.sideLength = 100;
  this.setupViewport();
  if (this.previewNode != null) {
    this.previewNode.height = this.paper.height;
    this.previewNode.width = this.paper.width;
    this.imageForRaphaelSVGImage = document.createElement("IMG");
    this.imageForRaphaelSVGImage.src = this.svgImage.attr("src");
    this.drawingContext = this.previewNode.getContext("2d");
  }
};

Croptasticr.prototype.updatePreview = function() {
  if (this.widthMultiplier == null) {
    this.widthMultiplier = 1 / (this.svgImage.attr("width") / this.imageForRaphaelSVGImage.width);
  }

  if (this.heightMultiplier == null) {
    this.heightMultiplier = 1 / (this.svgImage.attr("height") / this.imageForRaphaelSVGImage.height);
  }
  this.drawingContext.clearRect(0, 0, 500, 500);
  var image_coordinate_ul_x = (this.viewportCenterX - (this.sideLength / 2)) * this.widthMultiplier;
  var image_coordinate_ul_y = (this.viewportCenterY - (this.sideLength / 2)) * this.heightMultiplier;
  this.drawingContext.drawImage(this.imageForRaphaelSVGImage,
                                image_coordinate_ul_x, // start x
                                image_coordinate_ul_y, // start y
                                this.sideLength * this.widthMultiplier, // width of source rect
                                this.sideLength * this.heightMultiplier, // height of source rect
                                0, 0, 500, 500); // destination rectangle
};

Croptasticr.prototype.pointsToSVGPolygonString = function(points) {
  var svgstring = "M" + points[0]['x'] + "," + points[0]['y'] + " ";
  for (var i = 1; i < points.length; i++) {
    svgstring += "L" + points[i]['x'] + "," + points[i]['y'] + " ";
  }
  svgstring += "Z";
  return svgstring;
};

// Returns an array of points that represent a square with sides
// length sideLength around (x,y).  The points are returned in
// clockwise order starting from the upper left.
Croptasticr.prototype.squareAroundPoint = function(x, y, sideLength) {
  var halfSideLength = sideLength / 2;
  return [{'x' : x - halfSideLength,   // upper left
           'y' : y - halfSideLength},

          {'x' : x + halfSideLength,   // upper right
           'y' : y - halfSideLength},

          {'x' : x + halfSideLength,   // lower right
           'y' : y + halfSideLength},

          {'x' : x - halfSideLength,   // lower left
           'y' : y + halfSideLength}];
};

Croptasticr.prototype.drawResizeHandle = function(x, y) {
  if (this.lr_handle != null) {
    this.lr_handle.remove();
    this.lr_handle = null;
  }
  var handle_side_length = 10;
  var lr_handle_points = this.squareAroundPoint(x,
                                                y,
                                                handle_side_length);
  var handle_svg = this.pointsToSVGPolygonString(lr_handle_points);

  var lr_handle = this.paper.path(handle_svg).attr("fill",
                                                   "darkred");
  var croptasticr = this;
  lr_handle.drag(function(dx, dy, mouseX, mouseY, e) {
    var viewport_ul_x =
          croptasticr.viewportElement.matrix.x(croptasticr.viewportElement.attrs.path[0][1],
                                               croptasticr.viewportElement.attrs.path[0][2]);
    console.log("inside handle drag");
    croptasticr.scaleViewport(mouseX - viewport_ul_x);
    var realDX = mouseX - croptasticr.lastx;
    var realDY = mouseY - croptasticr.lasty;
    croptasticr.lastx = mouseX;
    croptasticr.lasty = mouseY;
    croptasticr.moveResizeHandle(realDX, realDY);
    croptasticr.drawShadeElement();
    croptasticr.updatePreview();
  },function(x, y, e) {
    croptasticr.lastx = x;
    croptasticr.lasty = y;
  });
  return lr_handle;
};

Croptasticr.prototype.drawViewport = function() {
  if (this.viewportElement != null) {
    this.viewportElement.remove();
    this.viewportElement = null;
  }

  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;

  var innerPolyPoints = this.squareAroundPoint(centerX, centerY,
                                               this.sideLength);

  var viewportSVG = this.pointsToSVGPolygonString(innerPolyPoints);

  this.viewportElement = this.paper.path(viewportSVG).attr("fill",
                                                           "transparent");
  // Draw resize handles.
  var croptasticr = this;
  this.lr_handle = this.drawResizeHandle(innerPolyPoints[2]['x'],
                                         innerPolyPoints[2]['y']);

  this.viewportElement.drag(function(dx, dy, x, y, e) {
    var realDX = (x - croptasticr.lastx);
    var realDY = (y - croptasticr.lasty);
    croptasticr.viewportCenterX += realDX;
    croptasticr.viewportCenterY += realDY;
    croptasticr.lastx = x;
    croptasticr.lasty = y;
    console.log("viewport drag: (" + realDX + "," + realDY + ")");
    croptasticr.moveInnerViewport(realDX, realDY);
    croptasticr.drawShadeElement();
  }, function(x, y, e) {
    croptasticr.lastx = x;
    croptasticr.lasty = y;
  });

  var st = this.paper.set();
  st.push(this.viewportElement, this.lr_handle);
  this.viewportElementAndHandlesSet = st;
};

Croptasticr.prototype.scaleViewport = function(newSideLength) {
  var multiplier = newSideLength / this.sideLength;
  this.sideLength = newSideLength;
  var viewport_ul =
        {
          'x':this.viewportElement.matrix.x(this.viewportElement.attrs.path[0][1],
                                           this.viewportElement.attrs.path[0][2]),
          'y':this.viewportElement.matrix.y(this.viewportElement.attrs.path[0][1],
                                            this.viewportElement.attrs.path[0][2])
        };
  var scaleString = "S" + multiplier + "," +
        multiplier + "," + viewport_ul['x'] + "," + viewport_ul['y'];
  this.viewportElement.transform("..." + scaleString);
  var newx = this.viewportElement.matrix.x(this.viewportElement.attrs.path[0][1], this.viewportElement.attrs.path[0][2]);
  var newy = this.viewportElement.matrix.y(this.viewportElement.attrs.path[0][1], this.viewportElement.attrs.path[0][2]);
  viewport_ul = {'x':newx,
                 'y':newy};
  this.viewportCenterX = viewport_ul['x'] + (newSideLength / 2);
  this.viewportCenterY = viewport_ul['y'] + (newSideLength / 2);
  console.log("new center: " + this.viewportCenterX + "," + this.viewportCenterY);
  // transform handle.
  var viewport_lr =
        {
          'x':this.viewportElement.matrix.x(this.viewportElement.attrs.path[2][1],
                                            this.viewportElement.attrs.path[2][2]),
          'y':this.viewportElement.matrix.y(this.viewportElement.attrs.path[2][1],
                                            this.viewportElement.attrs.path[2][2])
        };
  var xform_x = viewport_lr['x'];
};

Croptasticr.prototype.moveInnerViewport = function(dx, dy) {
  var xformString = "t" + dx + "," + dy;
  console.log(xformString);
  this.viewportElementAndHandlesSet.transform("..." + xformString);
  this.updatePreview();
};

Croptasticr.prototype.moveResizeHandle = function(dx, dy) {
  var xformString = "t" + dx + "," + dy;
  console.log(xformString);
  this.lr_handle.transform("..." + xformString);
};

Croptasticr.prototype.drawShadeElement = function() {
  if (this.shadeElement != null) {
    this.shadeElement.remove();
    this.shadeElement = null;
  }
  var strokeColor = "#949393";
  var polyFill = "#949393";
  var fillOpacity = .7;
  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;
  var viewport_points = this.squareAroundPoint(centerX, centerY, this.sideLength);
  var outerPolyPoints = [{'x' : 0, 'y' : 0},
                         {'x' : this.width, 'y' : 0},
                         {'x' : this.width, 'y' : this.height},
                         {'x' : 0, 'y' : this.height}];
  // Note the order of the points - it's required to go counter
  // clockwise with Raphael so that it considers this a subtraction
  // from the outer poly.
  var innerPolyPoints = viewport_points.reverse();

  var polySVG = this.pointsToSVGPolygonString(outerPolyPoints);
  polySVG += this.pointsToSVGPolygonString(innerPolyPoints);
  this.shadeElement = this.paper.path(polySVG).attr("fill",polyFill).attr("opacity", fillOpacity);
//  console.log(polySVG);
};


Croptasticr.prototype.setupViewport = function() {
  this.drawShadeElement();
  this.drawViewport();
};
