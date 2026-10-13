from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import LiveSession, SessionAttendance, SessionChatMessage
from .serializers import (
    LiveSessionSerializer,
    SessionAttendanceSerializer,
    SessionChatMessageSerializer,
)
from apps.accounts.permissions import IsTeacherOrAdmin, IsTeacherRole, IsLearnerRole
from apps.classes.models import Enrollment, ClassRoom


class ClassSessionListCreateView(generics.ListCreateAPIView):
    """
    List sessions for a class, or create a session (Teacher).
    """
    serializer_class = LiveSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        class_id = self.kwargs['class_id']
        return LiveSession.objects.filter(class_room_id=class_id).order_by('-scheduled_start')

    def perform_create(self, serializer):
        class_id = self.kwargs['class_id']
        classroom = ClassRoom.objects.get(pk=class_id)
        if classroom.teacher != self.request.user and not self.request.user.is_admin_role:
            raise permissions.PermissionDenied("Only the class teacher can schedule sessions.")
        serializer.save(class_room=classroom)


class SessionDetailView(generics.RetrieveAPIView):
    queryset = LiveSession.objects.all()
    serializer_class = LiveSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class TeacherStartSessionView(APIView):
    """
    Teacher flow: Live Classroom -> Start class
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]

    def post(self, request, pk):
        try:
            session = LiveSession.objects.get(pk=pk, class_room__teacher=request.user)
        except LiveSession.DoesNotExist:
            return Response({"detail": "Session not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        session.status = LiveSession.Status.LIVE
        session.actual_start = timezone.now()
        session.save()
        return Response(LiveSessionSerializer(session).data, status=status.HTTP_200_OK)


class TeacherEndSessionView(APIView):
    """
    Teacher flow: End session and optionally attach recording URL (Post-Class).
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]

    def post(self, request, pk):
        try:
            session = LiveSession.objects.get(pk=pk, class_room__teacher=request.user)
        except LiveSession.DoesNotExist:
            return Response({"detail": "Session not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        session.status = LiveSession.Status.ENDED
        session.actual_end = timezone.now()
        recording_url = request.data.get('recording_url', '')
        if recording_url:
            session.recording_url = recording_url
        session.save()
        return Response(LiveSessionSerializer(session).data, status=status.HTTP_200_OK)


class LearnerJoinSessionView(APIView):
    """
    Learner flow: Live Classroom -> Join Class
    Automatically logs learner attendance.
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def post(self, request, pk):
        try:
            session = LiveSession.objects.get(pk=pk)
        except LiveSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check enrollment
        is_enrolled = Enrollment.objects.filter(
            class_room=session.class_room,
            learner=request.user,
            status=Enrollment.Status.ENROLLED
        ).exists()
        if not is_enrolled and not session.class_room.visibility == ClassRoom.Visibility.PUBLIC:
            return Response({"detail": "You must be enrolled to join this session."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        attendance_status = SessionAttendance.AttendanceStatus.PRESENT
        if session.actual_start and (now - session.actual_start).total_seconds() > 900:  # 15 minutes late
            attendance_status = SessionAttendance.AttendanceStatus.LATE

        attendance, created = SessionAttendance.objects.get_or_create(
            session=session,
            learner=request.user,
            defaults={'status': attendance_status, 'joined_at': now}
        )
        return Response({
            "detail": "Joined live classroom successfully.",
            "room_id": session.room_id,
            "meeting_url": session.meeting_url,
            "attendance": SessionAttendanceSerializer(attendance).data
        }, status=status.HTTP_200_OK)


class LearnerLeaveSessionView(APIView):
    """
    Learner flow: Leave live session, records exit time and duration.
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def post(self, request, pk):
        try:
            attendance = SessionAttendance.objects.get(session_id=pk, learner=request.user)
        except SessionAttendance.DoesNotExist:
            return Response({"detail": "Attendance record not found."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        attendance.left_at = now
        delta = (now - attendance.joined_at).total_seconds()
        attendance.duration_seconds = max(0, int(delta))
        attendance.save()
        return Response(SessionAttendanceSerializer(attendance).data, status=status.HTTP_200_OK)


class SessionChatListCreateView(generics.ListCreateAPIView):
    """
    Live Classroom: Watch and Chat
    List messages or post a new message in live room.
    """
    serializer_class = SessionChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return SessionChatMessage.objects.filter(session_id=session_id)

    def perform_create(self, serializer):
        session_id = self.kwargs['session_id']
        serializer.save(sender=self.request.user, session_id=session_id)


class SessionAttendanceListView(generics.ListAPIView):
    """
    Teacher flow: Student Management -> View learner attendance
    """
    serializer_class = SessionAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return SessionAttendance.objects.filter(session_id=session_id).select_related('learner')
