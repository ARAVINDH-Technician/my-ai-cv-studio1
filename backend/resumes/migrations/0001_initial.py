from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Resume',
            fields=[
                ('id', models.CharField(help_text='UUID from Supabase', max_length=36, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('location', models.CharField(blank=True, max_length=255)),
                ('linkedin', models.URLField(blank=True)),
                ('github', models.URLField(blank=True)),
                ('portfolio', models.URLField(blank=True)),
                ('summary', models.TextField(blank=True)),
                ('skills', models.TextField(blank=True)),
                ('projects', models.TextField(blank=True)),
                ('internships', models.TextField(blank=True)),
                ('achievements', models.TextField(blank=True)),
                ('certifications', models.TextField(blank=True)),
                ('education', models.TextField(blank=True)),
                ('template', models.CharField(choices=[('template1', 'Template 1'), ('template2', 'Template 2'), ('template3', 'Template 3'), ('template4', 'Template 4'), ('template5', 'Template 5'), ('template6', 'Template 6'), ('template7', 'Template 7')], default='template1', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resumes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Resume',
                'verbose_name_plural': 'Resumes',
                'ordering': ['-created_at'],
            },
        ),
    ]
