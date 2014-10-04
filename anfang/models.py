from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class STIIUserProfile(models.Model):
    user = models.OneToOneField(User)
    relationship = models.OneToOneField(User, related_name='significantother')
