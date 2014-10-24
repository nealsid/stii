# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0013_auto_20141020_2107'),
    ]

    operations = [
        migrations.AddField(
            model_name='statusupdate',
            name='encrypted',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
