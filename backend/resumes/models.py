from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('school_student', 'School Student'),
        ('college_student', 'College Student'),
        ('working_professional', 'Working Professional'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='college_student')

    def __str__(self):
        return f"{self.user.username} - {self.get_user_role_display()}"


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class Resume(models.Model):
    TEMPLATE_CHOICES = [
        ('template1', 'Template 1'),
        ('template2', 'Template 2'),
        ('template3', 'Template 3'),
        ('template4', 'Template 4'),
        ('template5', 'Template 5'),
        ('template6', 'Template 6'),
        ('template7', 'Template 7'),
        ('template8', 'Template 8'),
    ]
    
    id = models.CharField(max_length=36, primary_key=True, help_text="UUID from Supabase")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    user_role = models.CharField(max_length=30, choices=UserProfile.ROLE_CHOICES, default='college_student')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    school_name = models.CharField(max_length=255, blank=True)
    class_grade = models.CharField(max_length=100, blank=True)
    college_name = models.CharField(max_length=255, blank=True)
    degree = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    cgpa = models.CharField(max_length=20, blank=True)
    job_title = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    work_experience = models.TextField(blank=True)
    career_objective = models.TextField(blank=True)
    professional_summary = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    projects = models.TextField(blank=True)
    internships = models.TextField(blank=True)
    achievements = models.TextField(blank=True)
    certifications = models.TextField(blank=True)
    education = models.TextField(blank=True)
    template = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='template1')
    theme_color = models.CharField(max_length=20, default='#9e7e6b')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Resume'
        verbose_name_plural = 'Resumes'
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
