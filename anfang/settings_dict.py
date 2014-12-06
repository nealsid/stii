#  Wrapper around a simple JSON dictionary that provides access to user settings

import json

class Settings():
  def __init__(self):
    self.SETTINGS_KEYS = ["delete_old_statuses"]
    self.settings_dict = {}

  def update_settings_from_dict(self, new_dict):
    pass

  def retrieve_setting(self, key):
    if key in self.SETTINGS_KEYS and key in self.settings_dict:
      return self.settings_dict[key]
    return None

  def update_setting(self, key, new_value):
    if key in self.SETTINGS_KEYS:
      self.settings_dict[key] = new_value

  def asJSON(self):
    return json.dumps(self.settings_dict)
