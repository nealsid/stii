/* global $, google, dust */

var lat = null;
var lng = null;
var map = null;
var service = null;

function preDocumentLoadSetup() {
  if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
  }
  // Initialize jQuery to all http requests contain the CSRF token
  // required by Django.
  var csrftoken = $.cookie('csrftoken');
  function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }

  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    }
  });
}

preDocumentLoadSetup();

$(document).ready(function() {
  postDocumentLoadSetup();
});

function postDocumentLoadSetup() {
  initializeGoogleMaps();
  getStatusUpdates();
  makeDivFileDropZone(document.getElementById("profile-picture"),
                      "Drop new profile picture here");

  $("#settings-dialog-container").dialog({
    modal: true,
    autoOpen: false,
    width: "100%",
    buttons: {
      Save: function() {
        saveSettings();
        $(this).dialog( "close" );
      },
      Cancel: function() {
        $(this).dialog( "close" );
      }
    },
    title: "Options"
  });

  $("#settings-icon").on("click", function() {
    settingsIconClicked();
  });

  $("#pic-crop-widget-container").dialog({
    modal: true,
    autoOpen: false,
    buttons: {
      "Use this picture": function() {
        commitCrop();
        $(this).dialog( "close" );
      },
      Cancel: function() {
        cancelCrop();
        $(this).dialog( "close" );
      }
    },
    title: "Crop this shit",
    position: {
      my: "left top",
      at: "left top",
      of: "#new-status"
    }
  });
}

function initializeGoogleMaps() {
  var mapOptions = {
    center: { lat:  40.7929616, lng: -73.96727329999999},
    zoom: 16
  };
  map = new google.maps.Map(document.getElementById('map'),
                            mapOptions);
  navigator.geolocation.getCurrentPosition(function(pos) {
    lat = pos.coords.latitude;
    lng = pos.coords.longitude;
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

function getStatusUpdates() {
  var template_fetch_done = false;
  var status_update_fetch_done = false;

  var status_updates = [];

  // TODO (nealsid): change this to use Django's reverse URL lookup
  // mechanism somehow for the URLs here (template variable in the DOM,
  // maybe?)
  $.get("/static/dust/status-update.html", function(data) {
    var compiled = dust.compile(data, "status");
    dust.loadSource(compiled);
    template_fetch_done = true;
    if (status_update_fetch_done) {
      renderStatusUpdates(status_updates);
    }
  });

  $.get("/anfang/fetch-status-updates", function(data) {
    status_updates = $.parseJSON(data);
    status_update_fetch_done = true;
    if (template_fetch_done) {
      renderStatusUpdates(status_updates);
    }
  });
}

function renderStatusUpdates(status_updates) {
  var container = document.getElementById("status_update_ul");
  if (container === null) {
    return;
  }
  var children = "";
  container.innerHTML = "";
  for (var i = 0; i < status_updates.length; i++) {
    dust.render("status", status_updates[i], function(err, out) {
      if (err === null) {
        children += out;
      }
    });
  }
  container.innerHTML = children;
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

var query_to_results = {};

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

function aspectRatioForImage(url) {
  var img = document.createElement("IMG");
  img.src = url;
  var img_width = img.naturalWidth;
  var img_height = img.naturalHeight;
  var aspect_ratio = img_height / img_width;
  return aspect_ratio;
}

function commitCrop() {
  var canvas = document.getElementById("profile-picture-crop-preview");
  var r = new RegExp("data:image/[a-z]{3};base64,");
  var data = canvas.toDataURL().replace(r, "");
  $.post("/anfang/profile_picture_upload", { data: data }, function(data) {
    alert('uploaded!');
  });

}

function cancelCrop() {
  $("#profile-img").css("display","block");
  $("#profile-picture-crop-preview").css("display","none");
}

function startPictureCroppingUI(picture_url) {
  $("#profile-img").css("display","none");
  $("#profile-picture-crop-preview").css("display","block");

  // Make the picture crop modal dialog expand to the RHS of the
  // browser.  Sadly we have to open the dialog so we can get the
  // position in pixels.  We specify the position in terms of the
  // query UI position API so we don't know it before jQuery positions
  // it.
  $("#pic-crop-widget-container").dialog("open");
  var position =  $("#pic-crop-widget-container").offset();
  var window_width = $(window).width();
  var window_height = $(window).height();
  var aspect_ratio = aspectRatioForImage(picture_url);

  var dialog_width = window_width - position.left;
  var dialog_height = aspect_ratio * dialog_width;

  // If calculating the height based on the width causes the
  // image to overflow vertically, specify the vertical height
  // to not overflow, and then recalculate the width.
  if (position.top + dialog_height > window_height) {
    dialog_height = window_height - position.top;
    dialog_width = dialog_height / aspect_ratio;
  }

  $("#pic-crop-widget-container").dialog("option", "width", dialog_width);
  $("#pic-crop-widget-container").dialog("option", "height", dialog_height);
  var c = new Croptasticr(document.getElementById("pic-crop-widget"),
                          document.getElementById("profile-picture-crop-preview"));
  c.setup(picture_url);
}

function undoDropZoneDragUI(element) {
  $(element).css("border", "");
  $(element).css("border-style", "");
  $(element).css("border-radius", "");
  $(element).children("img").css("opacity", "");
  $("#dnd_instructions").remove();
}

function makeDivFileDropZone(element, instructions) {
  var body = document.getElementsByTagName("body")[0];
  // We have to stop this event from firing in order to receive the
  // final drop event.
  element.addEventListener("dragover", function(e) {
    e.preventDefault();
  });

  // Get file data on drop
  element.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.dataTransfer.files.length == 0) {
      return;
    }
    var files = e.dataTransfer.files; // Array of all files
    var file = files[0];
    if (file.type.match(/image.*/)) {
      var reader = new FileReader();
      reader.onload = function(e2) { // finished reading file data.
	startPictureCroppingUI(e2.target.result);
      };
      reader.readAsDataURL(file); // start reading the file data.
      undoDropZoneDragUI(element);
    } else {
      // TODO (nealsid): handle this.
    }
  });

  // The "dragenter" event fires for every child element, so when we
  // process dragenter on children, we need to make sure that we only
  // do some behavior once; namely, modifynig the drop zone to have a
  // dotted border and adding the instructions.
  var modifiedDiv = false;
  document.addEventListener("mouseout", function(evt) {
    if (modifiedDiv) {
      undoDropZoneDragUI(element);
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
