# Generated by Django 3.0 on 2020-06-05 15:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0045_auto_20200605_1019'),
    ]

    operations = [
        migrations.AlterField(
            model_name='estimate',
            name='last_modified',
            field=models.DateField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='last_modified',
            field=models.DateField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='job',
            name='last_modified',
            field=models.DateField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='task',
            name='last_modified',
            field=models.DateField(auto_now=True),
        ),
    ]