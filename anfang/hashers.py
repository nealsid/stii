from django.contrib.auth.hashers import PBKDF2PasswordHasher
from django.core.cache import caches
from django.utils.crypto import (pbkdf2, constant_time_compare)

from .signals import hash_generated

import hashlib
import base64
import logging

class AnfangPasswordHasher(PBKDF2PasswordHasher):
    """
    Secure password hashing using the PBKDF2 algorithm (recommended).
    This differs from the default PBKDF2 included with Django because
    it allows you to split the output into two halves.  The first half
    is actually used as the password hash and the second is discarded,
    but can be used to generate a user-specific key.
    """

    algorithm = "anfang_pbkdf2_sha256"
    iterations = 20000
    _cache = caches['default']
    dklen = 64

    def encode_no_split(self, password, salt, iterations=None):
        return super(AnfangPasswordHasher, self).encode(password, salt, self.iterations)

    def encode_split(self, password, salt, iterations=None):
        hash = super(AnfangPasswordHasher, self).encode(password, salt, self.iterations)
        comps = hash.split("$", 3)
        hash_base64 = comps[3]
        (pw_hash, secret_key) = self.split_b64_encoded_string_in_bytes(hash_base64)
        return "%s$%d$%s$%s" % (self.algorithm, self.iterations, salt, pw_hash)

    def encode(self, password, salt, iterations=None):
        return self.encode_split(password, salt, iterations)

    def verify(self, password, encoded):
        pw_same = super(AnfangPasswordHasher, self).verify(password, encoded)
        if pw_same:
            algorithm, iterations, salt, ignore = encoded.split('$', 3)
            hash = self.encode_no_split(password, salt, int(iterations))
            comps = hash.split("$", 3)
            (pw, encryption_key) = self.split_b64_encoded_string_in_bytes(comps[3])
            self._cache.set(pw, encryption_key)
        return pw_same

    def split_b64_encoded_string_in_bytes(self, b64_string):
        string_bytes = base64.b64decode(b64_string.encode("ascii"))
        hash_split_point = len(string_bytes) / 2
        return (base64.b64encode(string_bytes[:hash_split_point]).decode("ascii"), string_bytes[hash_split_point:])

    @classmethod
    def removeKeyForPwHash(cls, pw_hash):
        if self._cache.has_key(pw_hash):
            key = self._cache.get(pw_hash)
            _cache.delete(pw_hash)
            return key
        return None
