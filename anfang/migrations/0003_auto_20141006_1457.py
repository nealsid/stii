# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('anfang', '0002_invitation'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserRelationship',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=25)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='invitation',
            name='user',
        ),
        migrations.DeleteModel(
            name='Invitation',
        ),
        migrations.RemoveField(
            model_name='stiiuserprofile',
            name='relationship',
        ),
        migrations.RemoveField(
            model_name='stiiuserprofile',
            name='user',
        ),
        migrations.DeleteModel(
            name='STIIUserProfile',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='primary_relationship',
            field=models.ForeignKey(to='anfang.UserRelationship'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='userprofile',
            name='relationships',
            field=models.ManyToManyField(related_name=b'secondary', to='anfang.UserRelationship'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='userprofile',
            name='user',
            field=models.OneToOneField(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
