#!/usr/bin/python2.7

from django.contrib.auth.models import User
from anfang.models import UserProfile, UserRelationship
from django.conf import settings
from django.test import Client
from django.core.urlresolvers import reverse

import logging

UserRelationship.objects.all().delete()
UserProfile.objects.all().delete()
User.objects.filter(username__startswith='user', email__startswith='nealsid+test').delete()

users = []

NUM_USERS = 100

if len(User.objects.filter(username='user1')) == 0:
    for i in range(NUM_USERS):
        user = User(first_name='User%dFirstName' % i,
                    last_name='User%dLastName' % i,
                    username='user%d' % i,
                    email='nealsid+test%d@gmail.com' % i,
                    # password is 'test'
                    password='pbkdf2_sha256$12000$mpCt9572ToHh$ouv28btSpDSjNoVyYRo/SIpAjMzgMYbYY3YG9HcW15A=',
                    is_active=True)
        users.append(user)

    User.objects.bulk_create(users)

# We have to do the following even when we've just created them
# because bulk_create doesn't set the primary_key field of the above
# objects when they're created in the database.
users = User.objects.filter(username__startswith='user', email__startswith='nealsid+test')

relationships = []
for i in range(NUM_USERS/2):
    relationship = UserRelationship(title="primary")
    relationship.save()
    relationships.append(relationship)

profile_pics = ['jay-z.jpg','beyonce.jpg',
                'bill_gates.jpg','melinda_gates.jpg',
                'sheryl_sandberg.jpg', 'zuckerberg.jpg']

userprofiles = []
for i in range(NUM_USERS):
    userprofile = UserProfile(user=users[i],
                              primary_relationship=relationships[i/2])
    userprofiles.append(userprofile)

UserProfile.objects.bulk_create(userprofiles)

for i in range(NUM_USERS):
    client = Client()
    logged_in = client.login(username=users[i].username, password="test")
    if not logged_in:
        logging.error("Could not log in " + users[i].username + ", skipping profile picture upload")
    profile_pic_name = profile_pics[i % len(profile_pics)]
    with open(profile_pic_name) as fp:
        resp = client.post(reverse("anfang:picture_save"), {'name':'profile_picture', 'profile_picture': fp})
    if resp.status_code == 302:
        if resp['Location'].find("err=invalid_image") == -1:
            logging.info("Uploaded pic for user " + users[i].username)
            continue
    logging.error("Error uploading pic for user " + users[i].username)
