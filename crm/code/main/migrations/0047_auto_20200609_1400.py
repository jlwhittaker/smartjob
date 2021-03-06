# Generated by Django 3.0 on 2020-06-09 19:00

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0046_auto_20200605_1020'),
    ]

    operations = [
        migrations.AlterField(
            model_name='estimate',
            name='job',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.Job'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='due_date',
            field=models.DateField(blank=True, default=datetime.date(2020, 7, 9), null=True),
        ),
    ]
