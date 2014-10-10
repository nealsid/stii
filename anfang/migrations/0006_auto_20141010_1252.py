# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0005_statusupdate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='primary_relationship',
            field=models.ForeignKey(to='anfang.UserRelationship', null=True),
        ),
    ]
