#  Wrapper around a simple JSON dictionary that provides access to user settings

import json

from .models import UserProfile

class Settings():
  def __init__(self):
    self.VALID_SETTING_KEYS = ["delete_old_statuses"]
    self.settings_dict = {}

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

  def updateUserProfile(self, user_profile):
    for key in self.VALID_SETTING_KEYS:
      if key in self.settings_dict:
        if key == "delete_old_statuses":
          if self.settings_dict['delete_old_statuses'] == None:
            user_profile.delete_older_than = None
          else:
            user_profile.delete_older_than = 30

  def asJSON(self):
    return json.dumps(self.settings_dict)

  @classmethod
  def fromJSON(self, json_dict):
    d = json.loads(json_dict)
    s = Settings()
    for one_key in d:
      s.update_setting(one_key, d[one_key])
    return s
