from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import StudyGroup, StudyGroupMessage, StudyPlan, StudyPlanItem
from .serializers import (
    StudyGroupSerializer,
    StudyGroupMessageSerializer,
    StudyPlanSerializer,
    StudyPlanItemSerializer,
)
from apps.accounts.permissions import IsLearnerRole


class StudyGroupListCreateView(generics.ListCreateAPIView):
    """
    Learner flow: Study Groups -> List or Create Study Group
    """
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        class_id = self.request.query_params.get('class_id')
        qs = StudyGroup.objects.all()
        if class_id:
            qs = qs.filter(class_room_id=class_id)
        return qs

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        group.members.add(self.request.user)


class StudyGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudyGroup.objects.all()
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class StudyGroupJoinLeaveView(APIView):
    """
    Learner joins or leaves a study group
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def post(self, request, pk):
        try:
            group = StudyGroup.objects.get(pk=pk)
        except StudyGroup.DoesNotExist:
            return Response({"detail": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user in group.members.all():
            group.members.remove(request.user)
            return Response({"detail": "Left the study group."}, status=status.HTTP_200_OK)
        else:
            group.members.add(request.user)
            return Response({"detail": "Joined the study group successfully."}, status=status.HTTP_200_OK)


class StudyGroupMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyGroupMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.kwargs['group_id']
        return StudyGroupMessage.objects.filter(group_id=group_id)

    def perform_create(self, serializer):
        group_id = self.kwargs['group_id']
        serializer.save(sender=self.request.user, group_id=group_id)


class StudyPlanListCreateView(generics.ListCreateAPIView):
    """
    Learner flow: Learner Dashboard -> Study Plan
    """
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def get_queryset(self):
        return StudyPlan.objects.filter(learner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(learner=self.request.user)


class StudyPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]
    lookup_field = 'id'

    def get_queryset(self):
        return StudyPlan.objects.filter(learner=self.request.user)


class StudyPlanItemCreateView(generics.CreateAPIView):
    serializer_class = StudyPlanItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def perform_create(self, serializer):
        plan_id = self.kwargs['plan_id']
        plan = StudyPlan.objects.get(pk=plan_id, learner=self.request.user)
        serializer.save(study_plan=plan)


class StudyPlanItemToggleView(APIView):
    """
    Toggle completion status of a study plan task item
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def patch(self, request, pk):
        try:
            item = StudyPlanItem.objects.get(pk=pk, study_plan__learner=request.user)
        except StudyPlanItem.DoesNotExist:
            return Response({"detail": "Item not found."}, status=status.HTTP_404_NOT_FOUND)

        item.is_completed = not item.is_completed
        item.completed_at = timezone.now() if item.is_completed else None
        item.save()
        return Response(StudyPlanItemSerializer(item).data, status=status.HTTP_200_OK)
