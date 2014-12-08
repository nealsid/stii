# -*- coding: utf-8 -*-
from __future__ import absolute_import

import json
import sys
import unittest

from .settings_dict import Settings

class SettingsDictTest(unittest.TestCase):
  def test_to_json(self):
    s = Settings()
    s.update_setting("delete_old_statuses", False)
    json_string = s.asJSON()
    new_settings = Settings.fromJSON(json_string)
    self.assertEquals(s.settings_dict, new_settings.settings_dict,
                      "Dictionary from parsed JSON was not equal")

  def test_add_setting_not_in_supported_keys(self):
    s = Settings()
    s.update_setting("FOOBAR", "FOO")
    self.assertEqual(s.retrieve_setting("FOOBAR"), None, "Was able to add unsupported key")

  def test_add_retrieve_setting(self):
    s = Settings()
    s.update_setting("delete_old_statuses", False)
    self.assertEqual(s.retrieve_setting("delete_old_statuses"), False, "Was not able to add supported key")
