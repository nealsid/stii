/*
 * Return outerHTML for the first element in a jQuery object,
 * or an empty string if the jQuery object is empty;
 */
jQuery.fn.outerHTML = function() {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function createRestaurant(name, photourl, lat, lng) {
  var restaurantNode = document.createElement("restaurant");
  restaurantNode.innerText = name;
  restaurantNode.setAttribute("name",name);
  restaurantNode.setAttribute("lat",lat);
  restaurantNode.setAttribute("lng",lng);
  if (photourl !== undefined ||
      photourl !== null) {
    restaurantNode.setAttribute("photourl", photourl);
  }
  return restaurantNode;
}
