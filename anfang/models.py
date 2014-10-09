from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User)
    profile_picture = models.ImageField(null=True)
    primary_relationship = models.ForeignKey('UserRelationship')
    relationships = models.ManyToManyField('UserRelationship', related_name="secondary")
    def __unicode__(self):
        return "%(email)s in a relationship with id: %(id)d" % {"email":self.user.email,"id":self.primary_relationship_id}

class UserRelationship(models.Model):
    title = models.CharField(max_length = 25)

class StatusUpdate(models.Model):
    relationship = models.ForeignKey('UserRelationship')
    text = models.CharField(max_length = 512)
    picture = models.ImageField(null = True)
    time = models.DateTimeField()

