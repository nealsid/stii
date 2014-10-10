# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0004_userprofile_profile_picture'),
    ]

    operations = [
        migrations.CreateModel(
            name='StatusUpdate',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=512)),
                ('picture', models.ImageField(null=True, upload_to=b'')),
                ('time', models.DateTimeField()),
                ('relationship', models.ForeignKey(to='anfang.UserRelationship')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
