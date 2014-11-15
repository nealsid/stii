var foo = null;
var lat = null;
var lng = null;
var map = null;
var service = null;
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  infowindow = new google.maps.InfoWindow();
  infowindow.setContent(place.name);
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function find_last_two_words(text) {
  var trimmed = text.trim();
  var i = trimmed.lastIndexOf(" ");
  if (i > 0) {
    var beforeI = trimmed.lastIndexOf(" ", i - 1);
    return trimmed.substring(beforeI + 1);
  }
  return text;
}

function clearGoogleSearchResults() {
  var parent = document.getElementById("google-search-results");
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function addGoogleSearchResult(name, iconurl, address) {
  var parent = document.getElementById("google-search-results");
  var icon = document.createElement("img");
  icon.src = iconurl;
  icon.width = 24;
  icon.height = 24;
  icon.className = "pull-left media-object";
  var text = document.createElement("div");
  text.className = "media-body";

  var header = document.createElement("h4");
  header.className = "media-heading";
  header.innerText = name;

  parent.appendChild(icon);
  text = parent.appendChild(text);
  text.appendChild(header);
  text.innerHTML += address;
}
$(document).ready(function() {
  map = new google.maps.Map(document.getElementById('map'),
			    mapOptions);
  foo = new google.maps.places.AutocompleteService();
  var mapOptions = {
    center: { lat:  40.7929616, lng: -73.96727329999999},
    zoom: 16
  };
  map = new google.maps.Map(document.getElementById('map'),
			    mapOptions);
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      map.setZoom(16);
      $("#map").css("-webkit-filter", "blur(0px)");
      map.panTo(new google.maps.LatLng(lat, lng));
      service = new google.maps.places.PlacesService(map);
    });

  $('#id_text').keyup(function(e){
    if (e.keyCode == 32) {
      // Grab last two words.
      var text = $("#id_text").val();
      var query = find_last_two_words(text);
      var x = {};
      x.keyword = query;
      x.location = new google.maps.LatLng(lat, lng);
      x.radius = 1000;
      x.rankby = google.maps.places.RankBy.DISTANCE;
      x.types = ['restaurant'];
      service.nearbySearch(
	x,
	function(results, status) {
	  clearGoogleSearchResults();
	  if (status != google.maps.places.PlacesServiceStatus.OK) {
	    console.log("Status from neabySearch call: " + status);
	    return;
	  }
	  for (i = 0; i < results.length; i++) {
	    addGoogleSearchResult(results[i].name,results[i].icon,results[i].vicinity);
	  }
	});
    }
  });
});
