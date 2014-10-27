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

@receiver(post_init)
def model_post_init(sender, **kwargs):
    o = kwargs['instance']
    is_encrypted = hasattr(o, "encrypted") and getattr(o, "encrypted")
    if not is_encrypted:
        return

    # We initialize key and crypter later on, if we find encrypted
    # fields in the instance.
    key = None
    crypter = None
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
            logging.error("Decrypted %(fieldname)s to: %(unencvalue)s " %
                          {'fieldname':field.name, 'unencvalue':unencrypted})
            setattr(o, field.name, unencrypted)
    setattr(o, "encrypted", False)

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
            logging.error("Encrypted %(fieldname)s from: %(unencvalue)s " %
                          {'fieldname':field.name, 'unencvalue':unencrypted_value})
            setattr(o, field.name, encrypted)
    setattr(o, "encrypted", True)
