from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',        models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('price',       models.DecimalField(decimal_places=2, max_digits=8)),
                ('category',    models.CharField(choices=[('starter','Starter'),('main','Main Course'),('dessert','Dessert'),('drink','Drink')], max_length=20)),
                ('is_veg',      models.BooleanField(default=False)),
                ('is_spicy',    models.BooleanField(default=False)),
                ('image_url',   models.URLField(blank=True)),
            ],
        ),
    ]
