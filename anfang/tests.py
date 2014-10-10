from django.test import TestCase
from django.conf import settings
from anfang.models import UserProfile, StatusUpdate
from django.test import Client
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User

import logging
import os
import tempfile

class PicUploadTests(TestCase):
    testPNG = os.path.join(settings.TEST_DATA, "hoek.png")
    testInvalidPNG = os.path.join(settings.TEST_DATA, "hoek-fuzzed.png")

    @classmethod
    def setUpClass(cls):
        logging.basicConfig(level=logging.INFO)
        # Create test user & profile
        u = User.objects.create_user("test1", "nealsid+test1@gmail.com", "test1")
        userprofile = UserProfile()
        userprofile.user = u
        userprofile.save()
        u.userprofile = userprofile
        u.save()

        # Override settings so that the uploads for the test cases
        # don't go into the application upload directory.
        settings.MEDIA_ROOT=os.path.join(tempfile.gettempdir(), 'profile-pictures')

        logging.info("Created test user: " + str(u))
        logging.info("Set temp directory to: " + settings.MEDIA_ROOT)

    def test_non_image_upload_gracefully_rejected(self):
        client = Client()
        self.assertTrue(client.login(username="test1",password="test1"))
        with open(self.testInvalidPNG) as fp:
            resp = client.post(reverse("anfang:picture_save"), {'name':'profile_picture', 'profile_picture': fp})
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp['Location'].find("err=invalid_image") != -1)

    def test_image_upload_valid_image(self):
        client = Client()
        self.assertTrue(client.login(username="test1",password="test1"))
        with open(self.testPNG) as fp:
            resp = client.post(reverse("anfang:picture_save"), {'name':'profile_picture', 'profile_picture': fp})
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp['Location'].find("err=invalid_image") == -1)
        u = User.objects.get(username="test1")
        self.assertIsNotNone(u)
        logging.info(u.userprofile.profile_picture.url)
