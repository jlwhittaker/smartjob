# Generated by Django 3.0 on 2020-06-05 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0043_auto_20200605_1017'),
    ]

    operations = [
        migrations.AlterField(
            model_name='job',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
    ]