function getUserSettings() {
  return {'days_older_than':30}
}

function settingsIconClicked() {
  $.get("/static/dust/settings-page.html", function(data) {
    var compiled = dust.compile(data, "settings");
    dust.loadSource(compiled);
    dust.render("settings", getUserSettings(), function(err, out) {
      if (err === null) {
        document.getElementById("settings-dialog-container").innerHTML = out;
        $("#settings-dialog-container").dialog("open");
      }
    });
  });
}


function saveSettings() {


}
