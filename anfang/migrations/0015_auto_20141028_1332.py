# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('anfang', '0014_statusupdate_encrypted'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserPicture',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('picture', models.ImageField(upload_to=b'')),
                ('user_profile', models.ForeignKey(to='anfang.UserProfile')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='profile_picture',
            field=models.OneToOneField(null=True, to='anfang.UserPicture'),
            preserve_default=True,
        ),
    ]
