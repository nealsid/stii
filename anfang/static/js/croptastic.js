"use strict";

function Croptasticr(parentNode) {
  this.parentNode = parentNode;
  this.paper = null;
  this.viewportCenterX = null;
  this.viewportCenterY = null;
  this.width = null;
  this.height = null;
  this.viewportElement = null;
  this.shadeElement = null;
  // The event handlers given window-relative coordinates, so store
  // the origin of the paper (in window-coordinates) to subtract from
  // event handler coordinates.
  this.xoffset = null;
  this.yoffset = null;
}

Croptasticr.prototype.pointsToSVGPolygonString = function(points) {
  var svgstring = "M" + points[0]['x'] + "," + points[0]['y'] + " ";
  for (var i = 1; i < points.length; i++) {
    svgstring += "L" + points[i]['x'] + "," + points[i]['y'] + " ";
  }
  svgstring += "Z";
  return svgstring;
};

Croptasticr.prototype.drawViewport = function() {
  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;
  var viewport_ul = {'x' : centerX - 50, 'y' : centerY - 50};
  var viewport_ur = {'x' : centerX + 50, 'y' : centerY - 50};
  var viewport_lr = {'x' : centerX + 50, 'y' : centerY + 50};
  var viewport_ll = {'x' : centerX - 50, 'y' : centerY + 50};
  var innerPolyPoints = [viewport_ul,
			 viewport_ur,
			 viewport_lr,
			 viewport_ll];
  var viewportSVG = this.pointsToSVGPolygonString(innerPolyPoints);
  this.viewportElement = this.paper.path(viewportSVG).attr("fill",
							   "transparent");
  console.log("viewport: " + viewportSVG);
};

Croptasticr.prototype.moveInnerViewport = function(dx, dy) {
  var xformString = "t" + dx + "," + dy;
  this.viewportElement.transform("..." + xformString);
  console.log("transform SVG: " + xformString);
  console.log("current xform: " + this.viewportElement.transform());
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
  console.log("initial viewport center: (" + this.viewportCenterX + "," + this.viewportCenterY + ")");

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
    console.log("new viewport center: (" + croptasticr.viewportCenterX + "," + croptasticr.viewportCenterY + ")");
//    console.log(croptasticr.viewportCenterX + " / " + croptasticr.viewportCenterY + " / " + (croptasticr.viewportCenterX + dx) + " / " + (croptasticr.viewportCenterY + dy) + " / " + (x - croptasticr.xoffset) + " / " + (y - croptasticr.yoffset));

    croptasticr.moveInnerViewport(realDX, realDY);
    croptasticr.drawShadeElement();
  }, function(x, y, e) {
    croptasticr.lastx = x;
    croptasticr.lasty = y;
  });
};

Croptasticr.prototype.setup = function(pic_url) {
  this.paper = Raphael(this.parentNode);
  var boundingRect = this.parentNode.getBoundingClientRect();
  this.xoffset = boundingRect.left + window.scrollX;
  this.yoffset = boundingRect.top + window.scrollY;
  console.log(window);
  this.width = boundingRect.width;
  this.height = boundingRect.height;
  this.paper.image(pic_url, 0, 0, this.width, this.height);

  this.viewportCenterX  = this.width / 2;
  this.viewportCenterY = this.height / 2;
  this.setupViewport();
};
