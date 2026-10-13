from django.urls import path
from .views import (
    ClassAssessmentListCreateView,
    AssessmentDetailView,
    SubmitAssessmentView,
    LearnerSubmissionsListView,
    TeacherAssessmentSubmissionsListView,
    TeacherGradeSubmissionView,
)

urlpatterns = [
    path('class/<uuid:class_id>/', ClassAssessmentListCreateView.as_view(), name='class-assessments-list-create'),
    path('<uuid:id>/', AssessmentDetailView.as_view(), name='assessment-detail'),
    path('<uuid:pk>/submit/', SubmitAssessmentView.as_view(), name='assessment-submit'),

    # Submissions and Grading
    path('learner/my-submissions/', LearnerSubmissionsListView.as_view(), name='learner-submissions-list'),
    path('<uuid:assessment_id>/submissions/', TeacherAssessmentSubmissionsListView.as_view(), name='teacher-assessment-submissions'),
    path('submissions/<uuid:pk>/grade/', TeacherGradeSubmissionView.as_view(), name='teacher-grade-submission'),
]
