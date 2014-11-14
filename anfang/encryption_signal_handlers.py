# This class defines the Django signal handlers that perform in-flight encryption
# and decryption of objects.

# Be **very** careful about logging inside this file.  Logging object
# values in production settings is a vector for data exposure due to
# logs being written to disk.  Only log at VERBOSE or higher and turn
# this logging on during development.

from anfang.key_management import find_key_for_instance
from anfang.keyfetcher import KeyFetcherForTestUsers
from anfang.crypto import Crypter
from django.db.models.signals import post_save, pre_save, pre_init, post_init
from django.dispatch import receiver
from django_fields.fields import EncryptedCharField, EncryptedDateTimeField

import base64
import logging

key_fetcher = KeyFetcherForTestUsers()

# This method is called for all model objects created in memory.  Some
# of these have come from the database and some of them are being
# filled in by the application before being saved for the first
# time. We only care about the ones being loaded from the db (so we
# can decrypt them); we differentiate through the use of the
# 'encrypted' field, which is set to false by default, but set to true
# when the model is saved/encrypted (see the model_pre_save handler
# below)
@receiver(post_init)
def model_post_init(sender, **kwargs):
    o = kwargs['instance']
    is_encrypted = hasattr(o, "encrypted") and getattr(o, "encrypted")
    if not is_encrypted:
        return
    has_encrypted_fields = False
    was_decrypted = False

    # We initialize key and crypter later on, if we find encrypted
    # fields in the instance.
    key = None
    crypter = None
    for field in o._meta.fields:
        if field.__class__ == EncryptedCharField:
            has_encrypted_fields = True
            if key is None:
                key = find_key_for_instance(o, key_fetcher)
                if key is None:
                    logging.error("Attempting to decrypt object for user with no key")
                    continue
            if crypter is None:
                crypter = Crypter()
            encrypted_value_b64 = getattr(o, field.name)
            encrypted_value = base64.b64decode(encrypted_value_b64.encode('ascii'))
            unencrypted = crypter.decrypt(encrypted_value, key)
            was_decrypted = True
            setattr(o, field.name, unencrypted)
    if has_encrypted_fields and was_decrypted:
        setattr(o, "encrypted", False)

@receiver(pre_save)
def model_pre_save(sender, **kwargs):
    o = kwargs['instance']
    has_encrypted_fields = False
    was_encrypted = False

    key = None
    crypter = None
    for field in o._meta.fields:
        if field.__class__ == EncryptedCharField:
            has_encrypted_fields = True
            if key is None:
                key = find_key_for_instance(kwargs['instance'], key_fetcher)
                if key is None:
                    logging.error("Trying to encrypt object for user, but have no key")
                    continue
            if crypter is None:
                crypter = Crypter()
            unencrypted_value = getattr(o, field.name)
            encrypted = base64.b64encode(crypter.crypt(unencrypted_value, key)).decode("ascii")
            was_encrypted = True
            setattr(o, field.name, encrypted)
    if has_encrypted_fields and was_encrypted:
        setattr(o, "encrypted", True)
