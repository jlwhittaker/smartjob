# Generated by Django 2.2.3 on 2019-08-18 20:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0018_auto_20190817_1653'),
    ]

    operations = [
        migrations.AlterField(
            model_name='invoice',
            name='customer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.Customer'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='date',
            field=models.DateField(blank=True, null=True, verbose_name='Invoice date'),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='isPaid',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='invoice',
            name='job',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.Job'),
        ),
    ]
