from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('resumes', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='resume',
            name='template',
            field=models.CharField(choices=[('template1', 'Template 1'), ('template2', 'Template 2'), ('template3', 'Template 3'), ('template4', 'Template 4'), ('template5', 'Template 5'), ('template6', 'Template 6'), ('template7', 'Template 7'), ('template8', 'Template 8')], default='template1', max_length=20),
        ),
        migrations.AddField(
            model_name='resume',
            name='theme_color',
            field=models.CharField(default='#9e7e6b', max_length=20),
        ),
    ]
