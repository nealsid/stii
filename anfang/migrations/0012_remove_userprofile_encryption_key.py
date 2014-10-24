# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0011_userprofile_encryption_key'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='encryption_key',
        ),
    ]
