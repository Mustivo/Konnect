from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import ClassRoom, ClassSchedule, Enrollment, ClassRating
from .serializers import (
    ClassRoomListSerializer,
    ClassRoomDetailSerializer,
    ClassRoomCreateUpdateSerializer,
    EnrollmentSerializer,
    ClassRatingSerializer,
    JoinClassByCodeSerializer,
)
from apps.accounts.permissions import IsTeacherOrAdmin, IsTeacherRole, IsLearnerRole, IsAdminUserRole


class PublicClassBrowseListView(generics.ListAPIView):
    """
    Learner / Public flow: Browse Classes
    Lists active and public classes with optional search and subject filtering.
    """
    serializer_class = ClassRoomListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = ClassRoom.objects.filter(visibility=ClassRoom.Visibility.PUBLIC, status=ClassRoom.Status.ACTIVE)
        search = self.request.query_params.get('search', None)
        subject = self.request.query_params.get('subject', None)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search) | Q(subject__icontains=search))
        if subject:
            qs = qs.filter(subject__iexact=subject)
        return qs


import uuid
from django.shortcuts import get_object_or_404

class ClassRoomDetailView(generics.RetrieveAPIView):
    """
    Retrieve single classroom details by UUID or slug.
    """
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_object(self):
        lookup = self.kwargs.get('id')
        try:
            uuid.UUID(str(lookup))
            return get_object_or_404(ClassRoom, id=lookup)
        except ValueError:
            return get_object_or_404(ClassRoom, slug=lookup)


class TeacherClassListCreateView(generics.ListCreateAPIView):
    """
    Teacher flow: My Classes -> Create/Manage Classes (Class Visibility, Class Limit)
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClassRoomCreateUpdateSerializer
        return ClassRoomListSerializer

    def get_queryset(self):
        return ClassRoom.objects.filter(teacher=self.request.user)


class TeacherClassRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Teacher flow: Edit / Update / Delete class
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]
    serializer_class = ClassRoomCreateUpdateSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return ClassRoom.objects.filter(teacher=self.request.user)


class AdminClassManageListView(generics.ListCreateAPIView):
    """
    Admin flow: Manage Classes (Visibility, Class limits, system-wide class overview)
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClassRoomCreateUpdateSerializer
        return ClassRoomListSerializer

    def get_queryset(self):
        qs = ClassRoom.objects.all()
        visibility = self.request.query_params.get('visibility')
        status_param = self.request.query_params.get('status')
        if visibility:
            qs = qs.filter(visibility=visibility.upper())
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return qs


class LearnerMyClassesListView(generics.ListAPIView):
    """
    Learner user flow: My Classes (List of classes currently enrolled in)
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def get_queryset(self):
        return Enrollment.objects.filter(
            learner=self.request.user,
            status=Enrollment.Status.ENROLLED
        ).select_related('class_room', 'class_room__teacher')


class EnrollInClassView(APIView):
    """
    Learner flow: Join a class by class ID.
    If public and not full, automatically enrolls.
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def post(self, request, class_id):
        try:
            classroom = ClassRoom.objects.get(pk=class_id)
        except ClassRoom.DoesNotExist:
            return Response({"detail": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

        if classroom.status != ClassRoom.Status.ACTIVE:
            return Response({"detail": "This class is currently not active."}, status=status.HTTP_400_BAD_REQUEST)

        if classroom.is_full:
            return Response({"detail": "Class has reached its maximum student limit."}, status=status.HTTP_400_BAD_REQUEST)

        if classroom.visibility == ClassRoom.Visibility.PRIVATE:
            return Response(
                {"detail": "This is a private class. Please join using an enrollment code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment, created = Enrollment.objects.get_or_create(
            class_room=classroom,
            learner=request.user,
            defaults={'status': Enrollment.Status.ENROLLED}
        )
        if not created and enrollment.status != Enrollment.Status.ENROLLED:
            enrollment.status = Enrollment.Status.ENROLLED
            enrollment.save()

        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_200_OK)


class JoinClassByCodeView(APIView):
    """
    Learner flow: Join class using join/enrollment code (Private or Public class).
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def post(self, request):
        serializer = JoinClassByCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['enrollment_code'].strip().upper()

        try:
            classroom = ClassRoom.objects.get(enrollment_code=code)
        except ClassRoom.DoesNotExist:
            return Response({"detail": "Invalid enrollment code."}, status=status.HTTP_404_NOT_FOUND)

        if classroom.is_full:
            return Response({"detail": "Class is full."}, status=status.HTTP_400_BAD_REQUEST)

        enrollment, created = Enrollment.objects.get_or_create(
            class_room=classroom,
            learner=request.user,
            defaults={'status': Enrollment.Status.ENROLLED}
        )
        if not created and enrollment.status != Enrollment.Status.ENROLLED:
            enrollment.status = Enrollment.Status.ENROLLED
            enrollment.save()

        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_200_OK)


class PostClassRatingCreateView(generics.CreateAPIView):
    """
    Learner flow: Post-Class Ratings & Reviews
    """
    serializer_class = ClassRatingSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def perform_create(self, serializer):
        class_room_id = self.request.data.get('class_room')
        # Check learner is enrolled
        is_enrolled = Enrollment.objects.filter(
            class_room_id=class_room_id,
            learner=self.request.user,
            status=Enrollment.Status.ENROLLED
        ).exists()
        if not is_enrolled:
            raise serializers.ValidationError({"detail": "You must be enrolled in this class to rate it."})
        serializer.save(learner=self.request.user)
