from rest_framework import serializers

from .models import Resume, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_role']


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = [
            'id',
            'user',
            'user_role',
            'name',
            'email',
            'phone',
            'location',
            'linkedin',
            'github',
            'portfolio',
            'school_name',
            'class_grade',
            'college_name',
            'degree',
            'department',
            'cgpa',
            'job_title',
            'company_name',
            'work_experience',
            'career_objective',
            'professional_summary',
            'summary',
            'skills',
            'projects',
            'internships',
            'achievements',
            'certifications',
            'education',
            'template',
            'theme_color',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class ResumeAppearanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['template', 'theme_color']
