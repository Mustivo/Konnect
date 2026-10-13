from django.urls import path
from .views import (
    StudyGroupListCreateView,
    StudyGroupDetailView,
    StudyGroupJoinLeaveView,
    StudyGroupMessageListCreateView,
    StudyPlanListCreateView,
    StudyPlanDetailView,
    StudyPlanItemCreateView,
    StudyPlanItemToggleView,
)

urlpatterns = [
    # Study Groups
    path('groups/', StudyGroupListCreateView.as_view(), name='study-groups-list-create'),
    path('groups/<uuid:id>/', StudyGroupDetailView.as_view(), name='study-group-detail'),
    path('groups/<uuid:pk>/membership/', StudyGroupJoinLeaveView.as_view(), name='study-group-join-leave'),
    path('groups/<uuid:group_id>/messages/', StudyGroupMessageListCreateView.as_view(), name='study-group-messages'),

    # Study Plans
    path('study-plans/', StudyPlanListCreateView.as_view(), name='study-plans-list-create'),
    path('study-plans/<uuid:id>/', StudyPlanDetailView.as_view(), name='study-plan-detail'),
    path('study-plans/<uuid:plan_id>/items/', StudyPlanItemCreateView.as_view(), name='study-plan-items-create'),
    path('study-plans/items/<uuid:pk>/toggle/', StudyPlanItemToggleView.as_view(), name='study-plan-item-toggle'),
]
