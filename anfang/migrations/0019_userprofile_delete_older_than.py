# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0018_auto_20141205_1716'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='delete_older_than',
            field=models.IntegerField(blank=True, null=True, choices=[(1, '1 day'), (2, '2 days'), (7, '1 week'), (30, 'About a month')]),
            preserve_default=True,
        ),
    ]
