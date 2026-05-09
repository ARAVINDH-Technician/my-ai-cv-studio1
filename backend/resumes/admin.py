from django.contrib import admin
from .models import Resume, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'user_role')
    list_filter = ('user_role',)
    search_fields = ('user__username', 'user__email')

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'user_role', 'email', 'template', 'theme_color', 'created_at')
    list_filter = ('user_role', 'template', 'created_at', 'user')
    search_fields = ('name', 'email', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('id', 'user', 'user_role', 'name', 'email', 'phone', 'location')
        }),
        ('Contact', {
            'fields': ('linkedin', 'github', 'portfolio')
        }),
        ('Content', {
            'fields': ('summary', 'skills', 'projects', 'internships', 'achievements', 'certifications', 'education')
        }),
        ('Settings', {
            'fields': ('template', 'theme_color', 'created_at', 'updated_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ('user',)
        return self.readonly_fields
        ('Role Details', {
            'fields': (
                'school_name', 'class_grade', 'college_name', 'degree', 'department', 'cgpa',
                'job_title', 'company_name', 'work_experience', 'career_objective', 'professional_summary'
            )
        }),
