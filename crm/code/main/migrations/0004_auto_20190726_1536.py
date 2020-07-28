# Generated by Django 2.2.3 on 2019-07-26 20:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20190722_1746'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='add_date',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Date added'),
        ),
        migrations.AlterField(
            model_name='customer',
            name='address',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='email',
            field=models.EmailField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='phone_number',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='customer',
            name='referral',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
