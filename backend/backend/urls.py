from django.contrib import admin
from django.urls import include, path
from resumes.views import admin_resume_dashboard, admin_resume_detail

urlpatterns = [
    path("", admin_resume_dashboard, name="admin_resume_dashboard"),
    path("resumes/<str:pk>/", admin_resume_detail, name="admin_resume_detail"),
    path("admin/", admin.site.urls),
    path("api/", include("resumes.urls")),
]
