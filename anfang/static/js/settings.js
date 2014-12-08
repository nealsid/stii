/* global userOptions, dust, $ */

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
        updateSettingsUIFromUserSettings();
        $("#settings-dialog-container").dialog("open");
      }
    });
  });
}

function updateSettingsUIFromUserSettings() {
  if (userOptions['delete_old_statuses'] === undefined ||
      userOptions['delete_old_statuses'] === null) {
    return;
  }
  $("#status-sweeper-checkbox").prop("checked", true);
}

function updateSettingsDictFromUI(dict) {
  if ($("#status-sweeper-checkbox").prop("checked") == false) {
    dict['delete_old_statuses'] = null;
  } else {
    dict['delete_old_statuses'] = 30;
  }
}

function saveSettingsAndCloseDialog() {
  updateSettingsDictFromUI(userOptions);
  var stringified = JSON.stringify(userOptions);
  $.get("/anfang/settings_save",
        {'options_dictionary_json':stringified},
        function() {
          $("#settings-dialog-container").dialog("close");
        }
       );
}

function initializeSettings() {
  $("#settings-dialog-container").dialog({
    modal: true,
    autoOpen: false,
    width: "50%",
    buttons: {
      Save: {
        click: function() {
          saveSettingsAndCloseDialog();
        },
        text: "Save",
        id: "save-settings"
      },
      Cancel: {
        click: function() {
          $(this).dialog( "close" );
        },
        text: "Cancel",
        id: "cancel-settings",
      }
    },
    title: "Options"
  });

  $("#settings-icon").on("click", function() {
    settingsIconClicked();
  });
}
