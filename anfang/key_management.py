from django.contrib.auth.models import User

import logging

def find_key_for_instance(instance, key_fetcher):
    next_obj = instance
    while hasattr(next_obj, 'owning_user_path'):
        next_obj = getattr(next_obj, getattr(next_obj, 'owning_user_path'))
    if next_obj.__class__ != User:
        logging.error("Model traversal for owning user did not yield user object")
        return None
    return key_fetcher.keyForUser(next_obj)
