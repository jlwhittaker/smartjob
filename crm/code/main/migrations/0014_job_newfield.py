# Generated by Django 2.2.3 on 2019-07-31 16:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0013_job_customer'),
    ]

    operations = [
        migrations.AddField(
            model_name='job',
            name='newfield',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
    ]
