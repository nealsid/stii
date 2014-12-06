# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django_fields.fields


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0017_place'),
    ]

    operations = [
        migrations.DeleteModel(
            name='UploadedPicture',
        ),
        migrations.AlterModelOptions(
            name='statusupdate',
            options={'verbose_name': 'status update', 'verbose_name_plural': 'status updates '},
        ),
        migrations.AlterField(
            model_name='statusupdate',
            name='text',
            field=django_fields.fields.EncryptedCharField(block_type=b'MODE_CFB', max_length=512, verbose_name=b''),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='userpicture',
            name='picture',
            field=models.ImageField(help_text=b'Upload a picture here.', upload_to=b''),
            preserve_default=True,
        ),
    ]
