# Generated by Django 4.2.20 on 2025-03-27 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('submissions', '0002_contact_delete_submission'),
    ]

    operations = [
        migrations.AddField(
            model_name='contact',
            name='status',
            field=models.CharField(choices=[('Not Viewed', 'Not Viewed'), ('Viewed', 'Viewed')], default='Not Viewed', max_length=20),
        ),
    ]
