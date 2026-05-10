from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ResumeViewSet,
    UserProfileViewSet,
    admin_resume_delete,
    admin_resume_list,
    sync_resume_to_admin,
)

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'profile', UserProfileViewSet, basename='profile')

urlpatterns = [
    path('sync-resume/', sync_resume_to_admin, name='sync_resume_to_admin'),
    path('admin-resumes/', admin_resume_list, name='admin_resume_list'),
    path('admin-resumes/<str:pk>/', admin_resume_delete, name='admin_resume_delete'),
    path('', include(router.urls)),
]
