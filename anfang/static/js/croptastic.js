/*jslint newcap: true, vars: true, indent: 2, node:true */
/*global alert:false, Raphael:false, window:false, document:false */
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
  this.handle_side_length = 15;
  // The outer element that is shaded, to indicate to users which
  // parts of the image aren't currently included.
  this.shadeElement = null;
  // The event handlers give window-relative coordinates, so store
  // the origin of the paper (in window-coordinates) to subtract from
  // event handler coordinates.
  this.xoffset = null;
  this.yoffset = null;

  if (previewNode !== null &&
      previewNode.tagName.toLowerCase() !== "canvas") {
    alert("Preview widget needs to be canvas");
  }

  // Preview-related object references
  this.previewNode = previewNode;
  this.previewWidth = null;
  this.previewHeight = null;
  // This stores a corresponding IMG DOM object for the IMAGE one that
  // Raphael creates (the Raphael one is SVG-specific).
  this.imageForRaphaelSVGImage = null;
  this.svgImage = null;
  this.drawingContext = null;
  this.widthMultiplier = null;
  this.heightMultiplier = null;
  this.sideLengthX = null;
  this.sideLengthY = null;
  this.viewportSizeThreshold = 20;
}

Croptasticr.prototype.setup = function (pic_url) {
  this.parentNode.innerHTML = "";
  this.paper = Raphael(this.parentNode);
  var boundingRect = this.parentNode.getBoundingClientRect();
  this.xoffset = boundingRect.left + window.scrollX;
  this.yoffset = boundingRect.top + window.scrollY;
  this.width = boundingRect.width;
  this.height = boundingRect.height;
  console.log("width: " + this.width);
  console.log("height: " + this.height);
  this.svgImage = this.paper.image(pic_url, 0, 0, this.width, this.height);

  this.viewportCenterX  = this.width / 2;
  this.viewportCenterY = this.height / 2;
  this.sideLengthX = 100;
  this.sideLengthY = 100;
  this.setupViewport();
  if (this.previewNode !== null) {
    this.imageForRaphaelSVGImage = document.createElement("IMG");
    this.imageForRaphaelSVGImage.src = this.svgImage.attr("src");
    this.drawingContext = this.previewNode.getContext("2d");
    this.previewWidth = $("#profile-picture-crop-preview").width();
    this.previewHeight = $("#profile-picture-crop-preview").height();
    this.updatePreview();
  }
};

Croptasticr.prototype.updatePreview = function () {
  if (this.previewNode === null) {
    return;
  }
  // We set these once by comparing with NULL here because we don't
  // know if the image has actually been loaded yet in the setup
  // function.
  if (this.widthMultiplier === null) {
    this.widthMultiplier =
      this.imageForRaphaelSVGImage.width / this.svgImage.attr("width");
  }
  if (this.heightMultiplier === null) {
    this.heightMultiplier =
      this.imageForRaphaelSVGImage.height / this.svgImage.attr("height");
  }
  this.drawingContext.clearRect(0, 0, this.previewWidth, this.previewHeight);
  var image_coordinate_ul_x = (this.viewportCenterX - (this.sideLengthX / 2)) * this.widthMultiplier;
  var image_coordinate_ul_y = (this.viewportCenterY - (this.sideLengthY / 2)) * this.heightMultiplier;

  // console.log("previewWidth : " + previewWidth );
  // console.log("previewHeight: " + previewHeight);

  // console.log("image_coordinate_ul_x: " + image_coordinate_ul_x);
  // console.log("image_coordinate_ul_y: " + image_coordinate_ul_y);
  // console.log("this.sideLengthX * this.widthMultiplier: " + (this.sideLengthX * this.widthMultiplier));
  // console.log("this.sideLengthY * this.heightMultiplier: " + (this.sideLengthY * this.heightMultiplier));
  this.drawingContext.drawImage(this.imageForRaphaelSVGImage,
                                image_coordinate_ul_x, // start x
                                image_coordinate_ul_y, // start y
                                this.sideLengthX * this.widthMultiplier, // width of source rect
                                this.sideLengthY * this.heightMultiplier, // height of source rect
                                0, 0, this.previewWidth, this.previewHeight); // destination rectangle
};

Croptasticr.prototype.pointsToSVGPolygonString = function (points) {
  var svgstring = "M" + points[0].x + "," + points[0].y + " ";
  var i = 0;
  for (i = 1; i < points.length; i += 1) {
    svgstring += "L" + points[i].x + "," + points[i].y + " ";
  }
  svgstring += "Z";
  return svgstring;
};

// Returns an array of points that represent a rectangle with sides
// length sideLength{X,Y} around (x,y).  The points are returned in
// clockwise order starting from the upper left.
Croptasticr.prototype.rectangleAroundPoint = function (x, y, sideLengthX, sideLengthY) {
  var halfXSideLength = sideLengthX / 2;
  var halfYSideLength = sideLengthY / 2;
  return [{'x' : x - halfXSideLength,   // upper left
           'y' : y - halfYSideLength},

          {'x' : x + halfXSideLength,   // upper right
           'y' : y - halfYSideLength},

          {'x' : x + halfXSideLength,   // lower right
           'y' : y + halfYSideLength},

          {'x' : x - halfXSideLength,   // lower left
           'y' : y + halfYSideLength}];
};

// Returns an array of points that represent a square with sides
// length sideLength around (x,y).  The points are returned in
// clockwise order starting from the upper left.
Croptasticr.prototype.squareAroundPoint = function (x, y, sideLength) {
  var halfSideLength = sideLength / 2;
  return this.rectangleAroundPoint(x, y, sideLength, sideLength);
};

Croptasticr.prototype.setCursorsForResize = function () {
  // We have to change the body cursor here because if we don't, the
  // browser will change the cursor to the non-drag one even if the
  // drag is ongoing while the mouse moves over another element.
  this.oldBodyCursor = document.getElementsByTagName("body")[0].style.cursor;
  document.getElementsByTagName("body")[0].style.cursor = "nwse-resize";
  this.oldViewportCursor = this.viewportElement.node.style.cursor;
  this.viewportElement.node.style.cursor = "nwse-resize";
};

Croptasticr.prototype.setCursorsForResizeEnd = function () {
  document.getElementsByTagName("body")[0].style.cursor = this.oldBodyCursor;
  this.viewportElement.node.style.cursor = this.oldViewportCursor;
};

Croptasticr.prototype.drawResizeHandle = function (x, y) {
  if (this.lr_handle !== null) {
    this.lr_handle.remove();
    this.lr_handle = null;
  }
  var lr_handle_points = this.squareAroundPoint(x,
                                                y,
                                                this.handle_side_length);
  var handle_svg = this.pointsToSVGPolygonString(lr_handle_points);
  var lr_handle = this.paper.path(handle_svg).attr("fill",
                                                   "#949393").attr("opacity", ".7");
  var croptasticr = this;
  /*jslint unparam: true*/
  lr_handle.drag(function (dx, dy, mouseX, mouseY, e) {
    console.log("inside drag");
    var viewport_ul_x =
          croptasticr.viewportElement.matrix.x(croptasticr.viewportElement.attrs.path[0][1],
                                               croptasticr.viewportElement.attrs.path[0][2]);
    var viewport_ul_y =
          croptasticr.viewportElement.matrix.y(croptasticr.viewportElement.attrs.path[0][1],
                                               croptasticr.viewportElement.attrs.path[0][2]);
    var viewport_lr_x = viewport_ul_x + croptasticr.sideLengthX;
    var viewport_lr_y = viewport_ul_y + croptasticr.sideLengthY;
    console.log("viewport_lr_x: " + viewport_lr_x);
    console.log("viewport_lr_y: " + viewport_lr_y);
    // Convert mouse coordinates from browser (which are in the
    // browser window coordinates) to paper/picture coordinates,
    // which is what Raphael expects.
    var mouseX_local = mouseX - croptasticr.xoffset;
    var mouseY_local = mouseY - croptasticr.yoffset;

    var lr_handle_ul_x = croptasticr.lr_handle.matrix.x(croptasticr.lr_handle.attrs.path[0][1],
							croptasticr.lr_handle.attrs.path[0][2]);
    var lr_handle_ul_y = croptasticr.lr_handle.matrix.y(croptasticr.lr_handle.attrs.path[0][1],
							croptasticr.lr_handle.attrs.path[0][2]);

    console.log("lr_handle_ul_x: " + lr_handle_ul_x);
    console.log("lr_handle_ul_y: " + lr_handle_ul_y);

    console.log("mouseX_local: " + mouseX_local);
    console.log("mouseY_local: " + mouseY_local);

    var viewport_size_dx = 0;
    var viewport_size_dy = 0;
    viewport_size_dx = mouseX_local - viewport_lr_x;
    viewport_size_dy = mouseY_local - viewport_lr_y;
    console.log("viewport_size_dx: " + viewport_size_dx);
    console.log("viewport_size_dy: " + viewport_size_dy);
    // dx/dy from Raphael are the changes in x/y from the drag start,
    // not the most recent change of the mouse.  Since we want to
    // track the mouse cursor as the user moves it, we need to figure
    // out the change from the last drag event we got, not the start
    // of the drag.  We store the last x/y we've received in
    // Croptasticr.last{x,y}, which is the same as what the viewport
    // drag does, so we're counting on this code and the code inside
    // the viewport drag never being executed at the same time, as
    // they would clobber each other's state.
    var newViewportX = viewport_lr_x + viewport_size_dx - viewport_ul_x;
    var newViewportY = viewport_lr_y + viewport_size_dy - viewport_ul_y;

    console.log("newviewportx: " + newViewportX);
    console.log("newviewporty: " + newViewportY);
    if (newViewportX < croptasticr.viewportSizeThreshold &&
        newViewportY < croptasticr.viewportSizeThreshold) {
      return;
    }

    if (newViewportX < croptasticr.viewportSizeThreshold) {
      croptasticr.scaleViewport(croptasticr.viewportSizeThreshold, newViewportY);
      croptasticr.lasty = mouseY;
      croptasticr.positionLRResizeHandle();
    } else if (newViewportY < croptasticr.viewportSizeThreshold) {
      croptasticr.scaleViewport(newViewportX, croptasticr.viewportSizeThreshold);
//      croptasticr.lastx = mouseX;
      croptasticr.positionLRResizeHandle();
    } else {
      croptasticr.scaleViewport(newViewportX, newViewportY);
      // croptasticr.lastx = mouseX;
      // croptasticr.lasty = mouseY;
      croptasticr.positionLRResizeHandle();
    }
    croptasticr.drawShadeElement();
    croptasticr.updatePreview();
  }, function (x, y, e) {
    // croptasticr.lastx = x;
    // croptasticr.lasty = y;
    croptasticr.setCursorsForResize();
  }, function (e) {
    croptasticr.setCursorsForResizeEnd();
  });
  /*jslint unparam: true*/
  lr_handle.toFront();
  return lr_handle;
};

Croptasticr.prototype.drawViewport = function () {
  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;
  var innerPolyPoints = this.rectangleAroundPoint(centerX, centerY,
                                                  this.sideLengthX,
                                                  this.sideLengthY);
  var viewportSVG = this.pointsToSVGPolygonString(innerPolyPoints);
  var croptasticr = this;
  var st;

  if (this.viewportElement !== null) {
    this.viewportElement.remove();
    this.viewportElement = null;
  }

  this.viewportElement = this.paper.path(viewportSVG).attr("fill",
                                                           "transparent");
  var viewport_lr_x =
        croptasticr.viewportElement.matrix.x(croptasticr.viewportElement.attrs.path[2][1],
                                             croptasticr.viewportElement.attrs.path[2][2]);
  var viewport_lr_y =
        croptasticr.viewportElement.matrix.y(croptasticr.viewportElement.attrs.path[2][1],
                                             croptasticr.viewportElement.attrs.path[2][2]);

  // Draw resize handles.
  this.lr_handle = this.drawResizeHandle(innerPolyPoints[2].x - (this.handle_side_length / 2),
                                         innerPolyPoints[2].y - (this.handle_side_length / 2));

  /*jslint unparam: true*/
  this.viewportElement.drag(function (dx, dy, x, y, e) {
    var realDX = (x - croptasticr.lastx);
    var realDY = (y - croptasticr.lasty);
    croptasticr.viewportCenterX += realDX;
    croptasticr.viewportCenterY += realDY;
    croptasticr.lastx = x;
    croptasticr.lasty = y;
    croptasticr.moveInnerViewport(realDX, realDY);
    croptasticr.drawShadeElement();
  }, function (x, y, e) {
    croptasticr.lastx = x;
    croptasticr.lasty = y;
  });
  /*jslint unparam: false*/

  st = this.paper.set();
  st.push(this.viewportElement, this.lr_handle);
  this.viewportElementAndHandlesSet = st;
  this.viewportElement.node.style.cursor = "-webkit-grabbing";
  this.lr_handle.node.style.cursor = "nwse-resize";
};

Croptasticr.prototype.scaleViewport = function (newSideLengthX, newSideLengthY) {

  var multiplierX = newSideLengthX / this.sideLengthX;
  var multiplierY = newSideLengthY / this.sideLengthY;

  this.sideLengthX = newSideLengthX;
  this.sideLengthY = newSideLengthY;

  var viewport_ul = {
    'x' : this.viewportElement.matrix.x(this.viewportElement.attrs.path[0][1],
                                      this.viewportElement.attrs.path[0][2]),
    'y' : this.viewportElement.matrix.y(this.viewportElement.attrs.path[0][1],
                                      this.viewportElement.attrs.path[0][2])
  };
  var scaleString = "S" + multiplierX + "," +
        multiplierY + "," + viewport_ul.x + "," + viewport_ul.y;
  this.viewportElement.transform("..." + scaleString);
  var newx = this.viewportElement.matrix.x(this.viewportElement.attrs.path[0][1],
                                           this.viewportElement.attrs.path[0][2]);
  var newy = this.viewportElement.matrix.y(this.viewportElement.attrs.path[0][1],
                                           this.viewportElement.attrs.path[0][2]);
  viewport_ul = {
    'x' : newx,
    'y' : newy
  };
  this.viewportCenterX = viewport_ul.x + (newSideLengthX / 2);
  this.viewportCenterY = viewport_ul.y + (newSideLengthY / 2);
};

Croptasticr.prototype.moveInnerViewport = function (dx, dy) {
  var xformString = "T" + dx + "," + dy;
  this.viewportElementAndHandlesSet.transform("..." + xformString);
  this.updatePreview();
};

Croptasticr.prototype.positionLRResizeHandle = function () {
  var viewport_lr_x =
        this.viewportElement.matrix.x(this.viewportElement.attrs.path[2][1],
                                      this.viewportElement.attrs.path[2][2]);
  var viewport_lr_y =
        this.viewportElement.matrix.y(this.viewportElement.attrs.path[2][1],
                                      this.viewportElement.attrs.path[2][2]);
  var lr_handle_x = this.lr_handle.matrix.x(this.lr_handle.attrs.path[0][1],
                                            this.lr_handle.attrs.path[0][2]);
  var lr_handle_y = this.lr_handle.matrix.y(this.lr_handle.attrs.path[0][1],
                                            this.lr_handle.attrs.path[0][2]);
  var dx = viewport_lr_x - this.handle_side_length - lr_handle_x;
  var dy = viewport_lr_y - this.handle_side_length - lr_handle_y;
  var xformString = "T" + dx + "," + dy;
  this.lr_handle.transform("..." + xformString);
};

Croptasticr.prototype.drawShadeElement = function () {
  if (this.shadeElement !== null) {
    this.shadeElement.remove();
    this.shadeElement = null;
  }
  var polyFill = "#949393";
  var fillOpacity = 0.7;
  var centerX = this.viewportCenterX;
  var centerY = this.viewportCenterY;
  var viewport_points = this.rectangleAroundPoint(centerX, centerY, this.sideLengthX, this.sideLengthY);
  var outerPolyPoints = [{'x' : 0, 'y' : 0},
                         {'x' : this.width, 'y' : 0},
                         {'x' : this.width, 'y' : this.height},
                         {'x' : 0, 'y' : this.height}];
  // Note the order of the points - it's required to go counter
  // clockwise with Raphael so that it considers this a subtraction
  // from the outer polygon.
  var innerPolyPoints = viewport_points.reverse();

  var polySVG = this.pointsToSVGPolygonString(outerPolyPoints);
  polySVG += this.pointsToSVGPolygonString(innerPolyPoints);
  this.shadeElement = this.paper.path(polySVG).attr("fill", polyFill).attr("opacity", fillOpacity);
  this.shadeElement.toBack();
  this.svgImage.toBack();
};

Croptasticr.prototype.setupViewport = function () {
  this.drawShadeElement();
  this.drawViewport();
};
