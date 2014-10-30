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
  var svgstring = "M" + points[0]['x'] + "," + points[0]['y'];
  for (var i = 1; i < points.length; i++) {
    svgstring += "L" + points[i]['x'] + "," + points[i]['y'];
  }
  svgstring += "Z";
  return svgstring;
};

Croptasticr.prototype.drawViewport = function() {

};

Croptasticr.prototype.setupViewport = function() {
  var strokeColor = "#949393";
  var polyFill = "#949393";
  var fillOpacity = .7;

  var outerPolyPoints = [{'x' : 0, 'y' : 0},
			 {'x' : this.width, 'y' : 0},
			 {'x' : this.width, 'y' : this.height},
			 {'x' : 0, 'y' : this.height}];
  if (this.viewportElement != null) {
    this.viewportElement.remove();
    this.viewportElement = null;
  }

  if (this.shadeElement != null) {
    this.shadeElement.remove();
    this.shadeElement = null;
  }

  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;
  var viewport_ul = {'x' : centerX - 50, 'y' : centerY - 50};
  var viewport_ur = {'x' : centerX + 50, 'y' : centerY - 50};
  var viewport_lr = {'x' : centerX + 50, 'y' : centerY + 50};
  var viewport_ll = {'x' : centerX - 50, 'y' : centerY + 50};
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

  var viewportPoints = innerPolyPoints.reverse();
  var viewportSVG = this.pointsToSVGPolygonString(viewportPoints);
  this.viewportElement = this.paper.path(viewportSVG).attr("fill","transparent");

  var croptasticr = this;
  this.viewportElement.drag(function(dx, dy, x, y, e) {
    croptasticr.viewportCenterX = x - croptasticr.xoffset;
    croptasticr.viewportCenterY = y - croptasticr.yoffset;
    croptasticr.setupViewport();
  }, function(x, y, e) {
    croptasticr.startx = x - croptasticr.xoffset;
    croptasticr.starty = y - croptasticr.yoffset;
  }, function(xe) {
    console.log("moving x by " + (croptasticr.finalx - croptasticr.startx) + " and y by: " + (croptasticr.finaly - croptasticr.starty));
  });
  console.log(polySVG);
  console.log(viewportSVG);
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
