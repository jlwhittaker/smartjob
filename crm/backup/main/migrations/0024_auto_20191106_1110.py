# Generated by Django 2.2.5 on 2019-11-06 17:10

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0023_auto_20190820_1747'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='due_date',
            field=models.DateField(blank=True, default=datetime.date(2019, 12, 6), null=True),
        ),
    ]