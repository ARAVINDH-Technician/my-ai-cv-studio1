import json
import uuid

from django.contrib.auth import get_user_model
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Resume, UserProfile
from .serializers import ResumeAppearanceSerializer, ResumeSerializer, UserProfileSerializer


def _text(value):
    if value is None:
        return ""
    return str(value)


def _resume_value(data, camel_key, snake_key=None):
    if camel_key in data:
        return data.get(camel_key)
    if snake_key:
        return data.get(snake_key)
    return data.get(camel_key)


def _cors_response(payload, status=200):
    response = JsonResponse(payload, status=status)
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@staff_member_required
def admin_resume_dashboard(request):
    resumes = (
        Resume.objects.select_related("user")
        .order_by("-updated_at", "-created_at")
    )
    return render(
        request,
        "resumes/admin_dashboard.html",
        {
            "resumes": resumes,
            "total_resumes": resumes.count(),
        },
    )


@staff_member_required
def admin_resume_detail(request, pk):
    resume = get_object_or_404(
        Resume.objects.select_related("user"),
        pk=pk,
    )
    return render(
        request,
        "resumes/admin_resume_detail.html",
        {"resume": resume},
    )


@csrf_exempt
def sync_resume_to_admin(request):
    if request.method == "OPTIONS":
        return _cors_response({})
    if request.method != "POST":
        return _cors_response({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _cors_response({"error": "Invalid JSON"}, status=400)

    resume_id = _text(data.get("id") or uuid.uuid4())
    if len(resume_id) > 36:
        resume_id = str(uuid.uuid5(uuid.NAMESPACE_URL, resume_id))

    user_key = _text(data.get("userId") or data.get("user_id") or data.get("email") or "frontend-user")
    username = user_key[:150]
    user_email = _text(data.get("userEmail") or data.get("user_email") or data.get("email"))
    User = get_user_model()
    user, _ = User.objects.get_or_create(username=username, defaults={"email": user_email})
    if user_email and user.email != user_email:
        user.email = user_email
        user.save(update_fields=["email"])

    user_role = _text(_resume_value(data, "userRole", "user_role") or "college_student")
    UserProfile.objects.update_or_create(user=user, defaults={"user_role": user_role})

    defaults = {
        "user": user,
        "user_role": user_role,
        "name": _text(data.get("name")),
        "email": _text(data.get("email") or user_email or "user@example.com"),
        "phone": _text(data.get("phone")),
        "location": _text(data.get("location")),
        "linkedin": _text(data.get("linkedin")),
        "github": _text(data.get("github")),
        "portfolio": _text(data.get("portfolio")),
        "school_name": _text(_resume_value(data, "schoolName", "school_name")),
        "class_grade": _text(_resume_value(data, "classGrade", "class_grade")),
        "college_name": _text(_resume_value(data, "collegeName", "college_name")),
        "degree": _text(data.get("degree")),
        "department": _text(data.get("department")),
        "cgpa": _text(data.get("cgpa")),
        "job_title": _text(_resume_value(data, "jobTitle", "job_title")),
        "company_name": _text(_resume_value(data, "companyName", "company_name")),
        "work_experience": _text(_resume_value(data, "workExperience", "work_experience")),
        "career_objective": _text(_resume_value(data, "careerObjective", "career_objective")),
        "professional_summary": _text(_resume_value(data, "professionalSummary", "professional_summary")),
        "summary": _text(data.get("summary")),
        "skills": _text(data.get("skills")),
        "projects": _text(data.get("projects")),
        "internships": _text(data.get("internships")),
        "achievements": _text(data.get("achievements")),
        "certifications": _text(data.get("certifications")),
        "education": _text(data.get("education")),
        "template": _text(data.get("template") or "template1"),
        "theme_color": _text(_resume_value(data, "themeColor", "theme_color") or "#9e7e6b"),
    }
    Resume.objects.update_or_create(id=resume_id, defaults=defaults)
    return _cors_response({"id": resume_id, "saved": True})


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=self.request.user, user_role=serializer.validated_data.get('user_role', profile.user_role))

    @action(detail=True, methods=['patch'], url_path='appearance')
    def appearance(self, request, pk=None):
        resume = self.get_object()
        serializer = ResumeAppearanceSerializer(resume, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(self.get_serializer(profile).data)

    def create(self, request, *args, **kwargs):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
