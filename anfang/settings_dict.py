#  Wrapper around a simple JSON dictionary that provides access to user settings

import json

from .models import UserProfile

class Settings():
  def __init__(self):
    self.VALID_SETTING_KEYS = ["delete_old_statuses"]
    self.settings_dict = {}

  def replace_settings_from_dict(self, new_dict):
    pass

  def retrieve_setting(self, key):
    if key in self.VALID_SETTING_KEYS and key in self.settings_dict:
      return self.settings_dict[key]
    return None

  def update_setting(self, key, new_value):
    if key in self.VALID_SETTING_KEYS:
      self.settings_dict[key] = new_value

  @classmethod
  def fromUserProfile(cls, user_profile):
    s = Settings()
    if user_profile.delete_older_than is not None:
      s.update_setting("delete_old_statuses", user_profile.delete_older_than)
    return s

  def asJSON(self):
    return json.dumps(self.settings_dict)
