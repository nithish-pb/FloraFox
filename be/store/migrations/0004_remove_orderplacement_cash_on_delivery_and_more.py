# Generated by Django 4.2.20 on 2025-04-03 14:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0003_alter_orderplacement_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='orderplacement',
            name='cash_on_delivery',
        ),
        migrations.AddField(
            model_name='orderplacement',
            name='payment_method',
            field=models.CharField(choices=[('cod', 'Cash on Delivery'), ('online', 'Online Payment')], default='cod', max_length=10),
        ),
    ]
