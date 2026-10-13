from django.urls import path
from .views import (
    ClassSessionListCreateView,
    SessionDetailView,
    TeacherStartSessionView,
    TeacherEndSessionView,
    LearnerJoinSessionView,
    LearnerLeaveSessionView,
    SessionChatListCreateView,
    SessionAttendanceListView,
)

urlpatterns = [
    # Sessions per class
    path('class/<uuid:class_id>/', ClassSessionListCreateView.as_view(), name='class-sessions-list-create'),
    path('<uuid:id>/', SessionDetailView.as_view(), name='session-detail'),

    # Teacher Session Controls
    path('<uuid:pk>/start/', TeacherStartSessionView.as_view(), name='session-start'),
    path('<uuid:pk>/end/', TeacherEndSessionView.as_view(), name='session-end'),

    # Learner Live Actions
    path('<uuid:pk>/join/', LearnerJoinSessionView.as_view(), name='session-join'),
    path('<uuid:pk>/leave/', LearnerLeaveSessionView.as_view(), name='session-leave'),

    # Live Classroom Chat
    path('<uuid:session_id>/chat/', SessionChatListCreateView.as_view(), name='session-chat'),

    # Attendance Records
    path('<uuid:session_id>/attendance/', SessionAttendanceListView.as_view(), name='session-attendance-list'),
]
