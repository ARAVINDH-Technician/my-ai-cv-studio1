from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ResumeViewSet, UserProfileViewSet, sync_resume_to_admin

router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'profile', UserProfileViewSet, basename='profile')

urlpatterns = [
    path('sync-resume/', sync_resume_to_admin, name='sync_resume_to_admin'),
    path('', include(router.urls)),
]
