# Generated by Django 2.2.3 on 2019-07-31 16:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0016_auto_20190731_1154'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='start_date',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Job start date'),
        ),
    ]
