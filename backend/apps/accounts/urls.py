from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    RegisterView,
    CurrentUserProfileView,
    TeacherProfileView,
    LearnerProfileView,
    AdminTeacherVerificationListView,
    AdminTeacherVerifyActionView,
    AdminAuditLogListView,
    ChangePasswordView,
    LogoutView,
)

urlpatterns = [
    # Auth & Tokens
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Profiles
    path('me/', CurrentUserProfileView.as_view(), name='user-profile-me'),
    path('me/teacher-profile/', TeacherProfileView.as_view(), name='teacher-profile-me'),
    path('me/learner-profile/', LearnerProfileView.as_view(), name='learner-profile-me'),

    # Admin Management
    path('admin/teachers/verifications/', AdminTeacherVerificationListView.as_view(), name='admin-teacher-verifications'),
    path('admin/teachers/verifications/<uuid:pk>/verify/', AdminTeacherVerifyActionView.as_view(), name='admin-teacher-verify-action'),
    path('admin/audit-logs/', AdminAuditLogListView.as_view(), name='admin-audit-logs'),
]
