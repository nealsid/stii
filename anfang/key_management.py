from django.contrib.auth.models import User
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.contrib.auth.decorators import user_passes_test, login_required
from django.core.urlresolvers import reverse

from anfang.keyfetcher import KeyFetcherForTestUsers

import logging

key_fetcher = KeyFetcherForTestUsers()

def user_login_and_key_required(function=None, redirect_field_name=REDIRECT_FIELD_NAME, login_url='/anfang/logout'):
    """
    Decorator for views that checks that the user is logged in, redirecting
    to the log-in page if necessary.
    """
    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and key_fetcher.keyForUser(u) != None,
        login_url=login_url,
        redirect_field_name=redirect_field_name
    )
    if function:
        return actual_decorator(function)
    return actual_decorator

def find_key_for_instance(instance, key_fetcher):
    next_obj = instance
    while hasattr(next_obj, 'owning_user_path'):
        next_obj = getattr(next_obj, getattr(next_obj, 'owning_user_path'))
    if next_obj.__class__ != User:
        logging.error("Model traversal for owning user did not yield user object")
        return None
    return key_fetcher.keyForUser(next_obj)
