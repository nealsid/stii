"use strict";

function Croptasticr(parentNode, previewNode) {
  this.parentNode = parentNode;
  this.paper = null;
  this.viewportCenterX = null;
  this.viewportCenterY = null;
  this.width = null;
  this.height = null;
  this.viewportElement = null;
  this.shadeElement = null;
  // The event handlers give window-relative coordinates, so store
  // the origin of the paper (in window-coordinates) to subtract from
  // event handler coordinates.
  this.xoffset = null;
  this.yoffset = null;
  if (previewNode.tagName.toLowerCase() != "canvas") {
    alert("Preview widget needs to be canvas");
  }
  this.previewNode = previewNode;
  // This stores a corresponding IMG DOM object for the IMAGE one that
  // Raphael creates (the Raphael one is SVG-specific).
  this.imageForRaphaelSVGImage = null;
  this.svgImage = null;
  this.drawingContext = null;
  this.widthMultiplier = null;
  this.heightMultiplier = null;

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
  var image_coordinate_ul_x = (this.viewportCenterX - 50) * this.widthMultiplier;
  var image_coordinate_ul_y = (this.viewportCenterY - 50) * this.heightMultiplier;
  this.drawingContext.drawImage(this.imageForRaphaelSVGImage,
				image_coordinate_ul_x, // start x
				image_coordinate_ul_y, // start y
				100 * this.widthMultiplier,  100 * this.heightMultiplier,  // width, height
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

Croptasticr.prototype.squareAroundPoint = function(x, y, sideLength) {
  var points = [{'x' : x - sideLength, 'y' : y - sideLength},  // upper left
		{'x' : x + sideLength, 'y' : y - sideLength},  // upper right
		{'x' : x + sideLength, 'y' : y + sideLength},  // lower right
		{'x' : x - sideLength, 'y' : y + sideLength}]; // lower left
  return points;
};

Croptasticr.prototype.drawViewport = function() {
  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;

  var innerPolyPoints = this.squareAroundPoint(centerX, centerY, 50);

  var viewportSVG = this.pointsToSVGPolygonString(innerPolyPoints);

  this.viewportElement = this.paper.path(viewportSVG).attr("fill",
							   "transparent");
  // Draw resize handles.
  var handle_side_length = 5;
  var lr_handle_points = this.squareAroundPoint(innerPolyPoints[2]['x'],
						innerPolyPoints[2]['y'],
						handle_side_length);
  var handle_svg = this.pointsToSVGPolygonString(lr_handle_points);

  this.paper.path(handle_svg).attr("fill",
				   "red");
};

Croptasticr.prototype.moveInnerViewport = function(dx, dy) {
  var xformString = "t" + dx + "," + dy;
  this.viewportElement.transform("..." + xformString);
  this.updatePreview();
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
  console.log("shade element cutout center: (" + this.viewportCenterX + "," + this.viewportCenterY + ")");
  var viewport_ul = {'x' : centerX - 50, 'y' : centerY - 50};
  var viewport_ur = {'x' : centerX + 50, 'y' : centerY - 50};
  var viewport_lr = {'x' : centerX + 50, 'y' : centerY + 50};
  var viewport_ll = {'x' : centerX - 50, 'y' : centerY + 50};
  var outerPolyPoints = [{'x' : 0, 'y' : 0},
			 {'x' : this.width, 'y' : 0},
			 {'x' : this.width, 'y' : this.height},
			 {'x' : 0, 'y' : this.height}];
  // Note the order of the points - it's required to go counter
  // clockwise with Raphael so that it considers this a subtraction
  // from the outer poly.
  var innerPolyPoints = [viewport_ul,
			 viewport_ll,
			 viewport_lr,
			 viewport_ur];

  var polySVG = this.pointsToSVGPolygonString(outerPolyPoints);
  polySVG += this.pointsToSVGPolygonString(innerPolyPoints);
  this.shadeElement = this.paper.path(polySVG).attr("fill",polyFill).attr("opacity", fillOpacity);
  console.log(polySVG);
};


Croptasticr.prototype.setupViewport = function() {
  if (this.viewportElement != null) {
    this.viewportElement.remove();
    this.viewportElement = null;
  }

  if (this.shadeElement != null) {
    this.shadeElement.remove();
    this.shadeElement = null;
  }

  this.drawShadeElement();
  this.drawViewport();
  var croptasticr = this;
  this.viewportElement.drag(function(dx, dy, x, y, e) {
    var realDX = (x - croptasticr.lastx);
    var realDY = (y - croptasticr.lasty);
    croptasticr.viewportCenterX += realDX;
    croptasticr.viewportCenterY += realDY;
    croptasticr.lastx = x;
    croptasticr.lasty = y;
    croptasticr.moveInnerViewport(realDX, realDY);
    croptasticr.drawShadeElement();
  }, function(x, y, e) {
    croptasticr.lastx = x;
    croptasticr.lasty = y;
  });
};
