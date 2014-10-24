from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save, pre_save, pre_init, post_init
from django.dispatch import receiver
from django_fields.fields import EncryptedCharField, EncryptedDateTimeField
from Crypto import Random
from Crypto.Cipher import AES

from .crypto import Crypter
from .hashers import AnfangPasswordHasher
from .keyfetcher import KeyFetcherForTestUsers

import base64
import logging

key_fetcher = KeyFetcherForTestUsers()

@receiver(pre_save)
def model_pre_save(sender, **kwargs):
    o = kwargs['instance']

    key = None
    crypter = None
    for field in o._meta.fields:
        if field.__class__ == EncryptedCharField:
            if key is None:
                key = find_key_for_instance(kwargs['instance'], key_fetcher)
                if key is None:
                    logging.error("Encrypted object for user with no key")
                    continue
            if crypter is None:
                crypter = Crypter()
            unencrypted_value = getattr(o, field.name)
            encrypted = base64.b64encode(crypter.crypt(unencrypted_value, key)).decode("ascii")
            setattr(o, field.name, encrypted)
    setattr(o, "encrypted", True)

class UserProfile(models.Model):
    owning_user_path = "user"

    user = models.OneToOneField(User)
    profile_picture = models.ImageField(null=True)
    primary_relationship = models.ForeignKey('UserRelationship', null = True)
    relationships = models.ManyToManyField('UserRelationship', related_name="secondary")

    def __unicode__(self):
        return "%(email)s in a relationship with id: %(id)d" % {"email":self.user.email,"id":self.primary_relationship_id}

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

@receiver(post_init, sender=StatusUpdate)
def model_post_init(sender, **kwargs):
    o = kwargs['instance']
    key = None
    crypter = None
    is_encrypted = getattr(o, "encrypted")
    if not is_encrypted:
        return

    for field in o._meta.fields:
        if field.__class__ == EncryptedCharField:
            if key is None:
                key = find_key_for_instance(o, key_fetcher)
                if key is None:
                    logging.error("Encrypted object for user with no key")
                    continue
            if crypter is None:
                crypter = Crypter()
            encrypted_value_b64 = getattr(o, field.name)
            encrypted_value = base64.b64decode(encrypted_value_b64.encode('ascii'))
            unencrypted = crypter.decrypt(encrypted_value, key)
            setattr(o, field.name, unencrypted)
    setattr(o, "encrypted", False)

def find_key_for_instance(instance, key_fetcher):
    next_obj = instance
    while hasattr(next_obj, 'owning_user_path'):
        next_obj = getattr(next_obj, getattr(next_obj, 'owning_user_path'))

    return key_fetcher.keyForUser(next_obj)
