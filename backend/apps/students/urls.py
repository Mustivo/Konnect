from django.urls import path
from .views import (
    BadgeListView,
    AwardBadgeView,
    LearnerBadgesListView,
    LearnerFlagListCreateView,
    LearnerFlagDetailUpdateView,
    LearnerProgressAndGradesView,
    TeacherStudentManagementOverviewView,
)

urlpatterns = [
    # Badges
    path('badges/', BadgeListView.as_view(), name='badges-list-create'),
    path('badges/award/', AwardBadgeView.as_view(), name='badges-award'),
    path('badges/my-badges/', LearnerBadgesListView.as_view(), name='learner-my-badges'),

    # Student Flags & Management
    path('flags/', LearnerFlagListCreateView.as_view(), name='learner-flags-list-create'),
    path('flags/<uuid:id>/', LearnerFlagDetailUpdateView.as_view(), name='learner-flags-detail-update'),

    # Learner Progress & Grades
    path('learner/progress-grades/', LearnerProgressAndGradesView.as_view(), name='learner-progress-grades'),

    # Teacher Student Management
    path('class/<uuid:class_id>/overview/', TeacherStudentManagementOverviewView.as_view(), name='teacher-student-management-overview'),
]
