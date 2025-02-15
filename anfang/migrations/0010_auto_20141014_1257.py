# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_fields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0009_auto_20141014_1247'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statusupdate',
            name='text',
            field=django_fields.fields.EncryptedCharField(block_type=b'MODE_CFB', max_length=512, verbose_name=b'New status'),
        ),
        migrations.AlterField(
            model_name='statusupdate',
            name='time',
            field=django_fields.fields.EncryptedDateTimeField(max_length=26, block_type=b'MODE_CFB'),
        ),
        migrations.AlterField(
            model_name='userrelationship',
            name='title',
            field=django_fields.fields.EncryptedCharField(max_length=25, block_type=b'MODE_CFB'),
        ),
    ]
