import django.dispatch

hash_generated = django.dispatch.Signal(providing_args=["hash"], use_caching=True)
