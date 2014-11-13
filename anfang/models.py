from anfang.crypto import Crypter
from anfang.hashers import AnfangPasswordHasher

from Crypto import Random
from Crypto.Cipher import AES
from django.contrib.auth.models import User
from django.db import models
from django_fields.fields import EncryptedCharField, EncryptedDateTimeField

import base64
import logging

class UserProfile(models.Model):
    owning_user_path = "user"

    user = models.OneToOneField(User)
    profile_picture = models.OneToOneField('UserPicture', null=True)
    primary_relationship = models.ForeignKey('UserRelationship', null=True)
    relationships = models.ManyToManyField('UserRelationship', related_name="secondary")

    def __unicode__(self):
        return ("%(email)s in a relationship with id: %(id)d"
                % {"email":self.user.email, "id":self.primary_relationship_id})

class UserPicture(models.Model):
    owning_user_path = "user_profile"

    user_profile = models.ForeignKey(UserProfile)
    picture = models.ImageField(help_text="Upload a profile picture here.")

class UserRelationship(models.Model):
    title = models.CharField(max_length = 25)

class StatusUpdate(models.Model):
    owning_user_path = "posting_user"

    relationship = models.ForeignKey(UserRelationship)
    posting_user = models.ForeignKey(User)
    text = EncryptedCharField(block_type='MODE_CFB', max_length = 512, verbose_name = "New status")
    picture = models.ImageField(null = True)
    time = EncryptedDateTimeField(block_type='MODE_CFB')
    encrypted = models.BooleanField(default=False)

    def __unicode__(self):
        return "%(text)s by %(user)s" % {"text":self.text,"user":self.posting_user}

class UploadedPicture(models.Model):
    picture = models.ImageField()

class Place(models.Model):
    name  = models.CharField(max_length = 50)
    latitude = models.DecimalField(max_digits=7,decimal_places=5)
    longitude = models.DecimalField(max_digits=7,decimal_places=5)
    google_place_id = models.CharField(max_length = 100)

    def __unicode__(self):
        return "%(name)s %(lat)f %(lng)f" % {'name':self.name,
                                             'lat':self.latitude,
                                             'lng':self.longitude}
