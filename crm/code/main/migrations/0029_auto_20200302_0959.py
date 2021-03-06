# Generated by Django 3.0 on 2020-03-02 15:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0028_auto_20200302_0958'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='finish_date',
            field=models.DateField(blank=True, null=True, verbose_name='Job finish date'),
        ),
        migrations.AlterField(
            model_name='job',
            name='start_date',
            field=models.DateField(blank=True, null=True, verbose_name='Job start date'),
        ),
    ]
