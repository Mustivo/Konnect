from django.urls import path
from .views import (
    AdminPlatformHealthView,
    AdminReportsAnalyticsView,
    TeacherReportsAnalyticsView,
)

urlpatterns = [
    path('admin/platform-health/', AdminPlatformHealthView.as_view(), name='admin-platform-health'),
    path('admin/reports-analytics/', AdminReportsAnalyticsView.as_view(), name='admin-reports-analytics'),
    path('teacher/reports-analytics/', TeacherReportsAnalyticsView.as_view(), name='teacher-reports-analytics'),
]
