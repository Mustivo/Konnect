from django.urls import path
from .views import (
    PublicClassBrowseListView,
    ClassRoomDetailView,
    TeacherClassListCreateView,
    TeacherClassRetrieveUpdateDestroyView,
    AdminClassManageListView,
    LearnerMyClassesListView,
    EnrollInClassView,
    JoinClassByCodeView,
    PostClassRatingCreateView,
)

urlpatterns = [
    # Public browsing
    path('browse/', PublicClassBrowseListView.as_view(), name='classes-browse'),
    path('<str:id>/', ClassRoomDetailView.as_view(), name='class-detail'),

    # Teacher Management
    path('teacher/my-classes/', TeacherClassListCreateView.as_view(), name='teacher-classes-list-create'),
    path('teacher/my-classes/<uuid:id>/', TeacherClassRetrieveUpdateDestroyView.as_view(), name='teacher-classes-detail'),

    # Admin Management
    path('admin/all-classes/', AdminClassManageListView.as_view(), name='admin-classes-manage'),

    # Learner Flow
    path('learner/my-classes/', LearnerMyClassesListView.as_view(), name='learner-classes-list'),
    path('learner/enroll/<uuid:class_id>/', EnrollInClassView.as_view(), name='learner-enroll-class'),
    path('learner/join-by-code/', JoinClassByCodeView.as_view(), name='learner-join-by-code'),

    # Post-class
    path('ratings/submit/', PostClassRatingCreateView.as_view(), name='post-class-rating-submit'),
]
