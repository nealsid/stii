# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0015_auto_20141028_1332'),
    ]

    operations = [
        migrations.CreateModel(
            name='UploadedPicture',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('picture', models.ImageField(upload_to=b'')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='userpicture',
            name='picture',
            field=models.ImageField(help_text=b'Upload a profile picture here.', upload_to=b''),
            preserve_default=True,
        ),
    ]
