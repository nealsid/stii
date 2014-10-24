# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_fields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0007_statusupdate_posting_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='statusupdate',
            name='text',
            field=django_fields.fields.EncryptedCharField(max_length=512, verbose_name=b'New status'),
        ),
    ]
