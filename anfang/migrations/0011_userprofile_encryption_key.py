# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0010_auto_20141014_1257'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='encryption_key',
            field=models.BinaryField(default='notavalidencryptionkey:-)'),
            preserve_default=False,
        ),
    ]
