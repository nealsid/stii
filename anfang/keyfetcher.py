# This class represents an interface for fetching keys for a given user
from django.contrib.auth.models import User
from .hashers import AnfangPasswordHasher

import base64

import logging

class KeyFetcher():
    def keyForUser(user):
        pass

    def setKeyForUser(user, key):
        pass

class KeyFetcherForTestUsers(KeyFetcher):
    def keyForUser(self, user):
        comps = user.password.split("$", 3)
        user_pw_hash = comps[3]
        if AnfangPasswordHasher._cache.has_key(user_pw_hash):
            return AnfangPasswordHasher._cache.get(user_pw_hash)
        return None
