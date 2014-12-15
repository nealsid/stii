# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_fields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0019_userprofile_delete_older_than'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statusupdate',
            name='text',
            field=django_fields.fields.EncryptedCharField(block_type=b'MODE_CFB', max_length=8192, verbose_name=b''),
            preserve_default=True,
        ),
    ]
