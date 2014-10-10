from django.test import TestCase
from django.conf import settings
from anfang.models import UserProfile, StatusUpdate
from django.test import Client
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User

import logging
import os

class PicUploadTests(TestCase):
    testPNG = os.path.join(settings.TEST_DATA, "hoek.png")
    testInvalidPNG = os.path.join(settings.TEST_DATA, "hoek-fuzzed.png")
                           
    def setUp(self):
        u = User.objects.create_user("test1", "nealsid+test1@gmail.com", "test1")
        userprofile = UserProfile()
        userprofile.user = u
        userprofile.save()
        u.userprofile = userprofile
        u.save()
        logging.info("Created test user: " + str(u))

    def test_non_image_upload_gracefully(self):
        client = Client()
        self.assertTrue(client.login(username="test1",password="test1"))
        with open(self.testInvalidPNG) as fp:
            resp = client.post(reverse("anfang:picture_save"), {'name':'profile_picture', 'attachment': fp})
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp['Location'].find("err=invalid_image") != -1)

    def test_image_upload_gracefully(self):
        client = Client()
        self.assertTrue(client.login(username="test1",password="test1"))
        with open(self.testPNG) as fp:
            resp = client.post(reverse("anfang:picture_save"), {'name':'profile_picture', 'attachment': fp})
        logging.error(str(resp))
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp['Location'].find("err=invalid_image") == -1)
