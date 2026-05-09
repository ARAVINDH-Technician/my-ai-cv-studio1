from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('resumes', '0002_resume_template8_theme_color'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_role', models.CharField(choices=[('school_student', 'School Student'), ('college_student', 'College Student'), ('working_professional', 'Working Professional')], default='college_student', max_length=30)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='auth.user')),
            ],
        ),
        migrations.AddField(
            model_name='resume',
            name='user_role',
            field=models.CharField(choices=[('school_student', 'School Student'), ('college_student', 'College Student'), ('working_professional', 'Working Professional')], default='college_student', max_length=30),
        ),
        migrations.AddField(
            model_name='resume',
            name='school_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='class_grade',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='resume',
            name='college_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='degree',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='department',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='cgpa',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='resume',
            name='job_title',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='company_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='resume',
            name='work_experience',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='resume',
            name='career_objective',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='resume',
            name='professional_summary',
            field=models.TextField(blank=True),
        ),
    ]
