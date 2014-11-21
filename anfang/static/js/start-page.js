var lat = null;
var lng = null;
var map = null;
var service = null;

if (!Date.now) {
  Date.now = function() { return new Date().getTime(); };
}

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

var query_to_results = {};

$(document).ready(function() {
  var mapOptions = {
    center: { lat:  40.7929616, lng: -73.96727329999999},
    zoom: 16
  };
  map = new google.maps.Map(document.getElementById('map'),
			    mapOptions);
  getStatusUpdates();
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      map.setZoom(16);
      $("#map").css("-webkit-filter", "blur(0px)");
      map.panTo({lat:lat,lng:lng});
      service = new google.maps.places.PlacesService(map);
    });

  $('#id_text').keyup(function(e){
    if (e.keyCode == 32) {
      // Grab last two words.
      var text = $("#id_text").val();
      var query_words = text.split(" ");
      clearGoogleSearchResults();
      for (var i = 0; i < query_words.length; i++) {
	var query = query_words[i];
	if (query === "" || query_to_results[query] !== undefined) {
	  console.log("skipping " + query);
	  continue;
	}
	issuePlacesSearchAndUpdateUI(query);
      }
    }
  });
});

function getStatusUpdates() {
  var container = document.getElementById("status_update_ul");
  if (container === null) {
    return;
  }
  container.innerHTML = "";
  // TODO (nealsid): change this to use Django's reverse URL lookup
  // mechanism somehow for the URL here (template variable in the DOM,
  // maybe?)
  var children = "";
  $.get("/anfang/fetch-status-updates", function(data) {
    var status_updates = $.parseJSON(data);
    $.get("/static/dust/status-update.html", function(data) {
      var compiled = dust.compile(data, "status");
      dust.loadSource(compiled);
      for (var i = 0; i < status_updates.length; i++) {
	dust.render("status", status_updates[i], function(err, out) {
	  if (err === null) {
	    children += out;
	  }
	});
      }
      container.innerHTML = children;
    });
  });
}

function showDeleteLink(element) {
  $(element).children(".status-update-box").children("#delete-link").css("visibility", "visible");
}

function hideDeleteLink(element) {
  $(element).children(".status-update-box").children("#delete-link").css("visibility", "hidden");
}

function issueDeleteStatusRequest(url, sid) {
  $("#" + sid).css("-webkit-filter", "blur(50px)");
  $.get(url + "?sid=" + sid, function(data) {
    if (data == "OK") {
      $("#" + sid).remove();
    } else {
      $("#" + sid).css("-webkit-filter", "blur(0px)");
    }
  });
}

function issuePlacesSearchAndUpdateUI(query) {
  var x = {};
  x.keyword = query;
  x.location = new google.maps.LatLng(lat, lng);
  x.radius = 1000;
  x.rankby = google.maps.places.RankBy.DISTANCE;
  x.types = ['restaurant'];
  query_to_results[query] = [];
  console.log("issuing query: " + query);
  console.log("rpc issue ts: " + Date.now());
  service.nearbySearch(
    x,
    function(results, status) {
      console.log("rpc return ts: " + Date.now());
      clearGoogleSearchResults();
      if (status != google.maps.places.PlacesServiceStatus.OK) {
	console.log("Status from neabySearch call: " + status);
	return;
      }
      for (var i = 0; i < results.length; i++) {
	addGoogleSearchResult(results[i].name, results[i].icon, results[i].vicinity);
	console.log("adding result for " + query);
	query_to_results[query].push({'name':results[i].name, 'icon_url':results[i].icon, 'addr':results[i].vicinity});
      }
    }
  );
}

function makeDivFileDropZone(element, instructions) {
  var body = document.getElementsByTagName("body")[0];
  if (body === null) {
    console.log("Error finding body element to attach drag events");
    return;
  }

  // Get file data on drop
  element.addEventListener("dragover", function(e) {
    e.preventDefault();
  });

  element.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log("inside drop listener");
    var files = e.dataTransfer.files; // Array of all files
    for (var i=0, file; file=files[i]; i++) {
      if (file.type.match(/image.*/)) {
        var reader = new FileReader();
        reader.onload = function(e2) { // finished reading file data.
	  var c = new Croptasticr(document.getElementById("pic-crop-widget"), null);
          c.setup(e2.target.result);
        };
        reader.readAsDataURL(file); // start reading the file data.
      }
    }
  });
  var modifiedDiv = false;
  document.addEventListener("mouseout", function(evt) {
    if (modifiedDiv) {
      $(element).css("border", "");
      $(element).css("border-style", "");
      $(element).css("border-radius", "");
      $(element).children("img").css("opacity", "");
      $("#dnd_instructions").remove();
      modifiedDiv = false;
    }
  });
  body.addEventListener("dragenter", function(evt) {
    if (!modifiedDiv) {
      $(element).css("border", "lightblue");
      $(element).css("border-radius", "10px");
      $(element).css("border-style", "dotted");
      $(element).children("img").css("opacity", ".2");
      var instructionsDiv = document.createElement("div");
      instructionsDiv.id = "dnd_instructions";
      instructionsDiv.innerHTML = instructions;
      $(instructionsDiv).css("position","absolute");
      $(instructionsDiv).css("font-size","25px");
      $(instructionsDiv).css("color","grey");
      $(instructionsDiv).css("margin","auto");
      $(instructionsDiv).css("width","50%");
      $(instructionsDiv).css("display","none");
      // This is HORRIBLE.  To vertically center the instructions, we
      // need to set the height. But the div fills the container
      // vertically due to the {top, left, right, bottom} positioning
      // below, so the div height doesn't fit the actual text snugly.
      // So we add the div to the DOM without any display, get the
      // calculated height, then remove and readd it with the proper
      // CSS to get vertical centering.
      element.appendChild(instructionsDiv);
      var instructionsHeight = $(instructionsDiv).outerHeight();
      console.log("div height: " + instructionsHeight);
      $(instructionsDiv).remove();
      $(instructionsDiv).css("display","");
      $(instructionsDiv).css("height", instructionsHeight + "px");
      $(instructionsDiv).css("top","0");
      $(instructionsDiv).css("left","0");
      $(instructionsDiv).css("right","0");
      $(instructionsDiv).css("bottom","0");
      element.appendChild(instructionsDiv);
      modifiedDiv = true;
    }
  });
}
