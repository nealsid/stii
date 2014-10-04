function arePasswordFieldsTheSame() {
  var pw1 = $("#password").val();
  var pw2 = $("#password_confirm").val();
  return pw1 == pw2;
}

function validatePasswordsAndUpdateUI() {
  var areSame = arePasswordFieldsTheSame();
  if (!areSame) {
    $("#pwdonotmatch").css("visibility", "");
  } else {
    $("#pwdonotmatch").css("visibility", "hidden");
  }
  return false;
}
