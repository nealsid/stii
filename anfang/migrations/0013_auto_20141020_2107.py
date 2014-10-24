# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0012_remove_userprofile_encryption_key'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userrelationship',
            name='title',
            field=models.CharField(max_length=25),
        ),
    ]
