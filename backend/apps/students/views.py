from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
from django.utils import timezone
from .models import Badge, LearnerBadge, LearnerFlag
from .serializers import (
    BadgeSerializer,
    LearnerBadgeSerializer,
    AwardBadgeInputSerializer,
    LearnerFlagSerializer,
    LearnerFlagCreateUpdateSerializer,
)
from apps.accounts.permissions import IsTeacherOrAdmin, IsTeacherRole, IsLearnerRole
from apps.classes.models import ClassRoom, Enrollment
from apps.assessments.models import AssessmentSubmission
from apps.live_sessions.models import SessionAttendance


class BadgeListView(generics.ListCreateAPIView):
    """
    List all badges or create a badge (Teacher/Admin).
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]


class AwardBadgeView(generics.CreateAPIView):
    """
    Teacher flow: Post-Class -> Badges
    Award a badge to a learner.
    """
    serializer_class = AwardBadgeInputSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherRole]

    def perform_create(self, serializer):
        serializer.save(awarded_by=self.request.user)


class LearnerBadgesListView(generics.ListAPIView):
    """
    Learner flow: View my badges
    """
    serializer_class = LearnerBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_learner_role:
            return LearnerBadge.objects.filter(learner=user)
        learner_id = self.request.query_params.get('learner_id')
        if learner_id:
            return LearnerBadge.objects.filter(learner_id=learner_id)
        return LearnerBadge.objects.all()


class LearnerFlagListCreateView(generics.ListCreateAPIView):
    """
    Teacher flow: Student Management -> View learner flags / Flag student
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LearnerFlagCreateUpdateSerializer
        return LearnerFlagSerializer

    def get_queryset(self):
        qs = LearnerFlag.objects.all()
        class_id = self.request.query_params.get('class_id')
        status_param = self.request.query_params.get('status')
        if class_id:
            qs = qs.filter(class_room_id=class_id)
        if status_param:
            qs = qs.filter(status=status_param.upper())
        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class LearnerFlagDetailUpdateView(generics.RetrieveUpdateAPIView):
    """
    Teacher flow: Student Management -> Manage & Improve (Update flag, action plan, resolve)
    """
    queryset = LearnerFlag.objects.all()
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LearnerFlagCreateUpdateSerializer
        return LearnerFlagSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status == LearnerFlag.Status.RESOLVED and not instance.resolved_at:
            instance.resolved_at = timezone.now()
            instance.save()


class LearnerProgressAndGradesView(APIView):
    """
    Learner flow: Learner Dashboard -> Progress & Grades
    Returns attendance rate, grades per assessment, teacher feedback, and awarded badges.
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def get(self, request):
        user = request.user
        class_id = request.query_params.get('class_id')

        # Submissions & Grades
        sub_qs = AssessmentSubmission.objects.filter(learner=user, status=AssessmentSubmission.Status.GRADED)
        if class_id:
            sub_qs = sub_qs.filter(assessment__class_room_id=class_id)

        avg_score = sub_qs.aggregate(Avg('total_score'))['total_score__avg']

        grades_data = [
            {
                "assessment_id": sub.assessment.id,
                "assessment_title": sub.assessment.title,
                "assessment_type": sub.assessment.assessment_type,
                "score": sub.total_score,
                "max_score": sub.assessment.max_score,
                "teacher_feedback": sub.teacher_feedback,
                "submitted_at": sub.submitted_at
            }
            for sub in sub_qs
        ]

        # Attendance stats
        att_qs = SessionAttendance.objects.filter(learner=user)
        if class_id:
            att_qs = att_qs.filter(session__class_room_id=class_id)

        total_sessions = att_qs.count()
        attended = att_qs.filter(status=SessionAttendance.AttendanceStatus.PRESENT).count()
        late = att_qs.filter(status=SessionAttendance.AttendanceStatus.LATE).count()
        attendance_rate = round(((attended + late) / total_sessions * 100), 1) if total_sessions > 0 else 100.0

        # Badges
        badges_qs = LearnerBadge.objects.filter(learner=user)
        if class_id:
            badges_qs = badges_qs.filter(class_room_id=class_id)
        badges_data = LearnerBadgeSerializer(badges_qs, many=True).data

        return Response({
            "learner_email": user.email,
            "overall_average_score": round(avg_score, 2) if avg_score else None,
            "total_assessments_taken": sub_qs.count(),
            "attendance_rate_percentage": attendance_rate,
            "total_sessions_attended": attended + late,
            "grades_and_feedback": grades_data,
            "badges": badges_data
        }, status=status.HTTP_200_OK)


class TeacherStudentManagementOverviewView(APIView):
    """
    Teacher flow: Student Management -> View learner attendance, grades, and flags
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request, class_id):
        try:
            classroom = ClassRoom.objects.get(pk=class_id)
        except ClassRoom.DoesNotExist:
            return Response({"detail": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

        enrollments = Enrollment.objects.filter(
            class_room=classroom,
            status=Enrollment.Status.ENROLLED
        ).select_related('learner')

        student_list = []
        for enroll in enrollments:
            student = enroll.learner

            # Attendance
            total_att = SessionAttendance.objects.filter(session__class_room=classroom, learner=student).count()
            present_att = SessionAttendance.objects.filter(
                session__class_room=classroom,
                learner=student,
                status__in=[SessionAttendance.AttendanceStatus.PRESENT, SessionAttendance.AttendanceStatus.LATE]
            ).count()
            att_rate = round((present_att / total_att * 100), 1) if total_att > 0 else 100.0

            # Grades
            avg_grade = AssessmentSubmission.objects.filter(
                assessment__class_room=classroom,
                learner=student,
                status=AssessmentSubmission.Status.GRADED
            ).aggregate(Avg('total_score'))['total_score__avg']

            # Open Flags
            open_flags = LearnerFlag.objects.filter(
                class_room=classroom,
                learner=student,
                status__in=[LearnerFlag.Status.OPEN, LearnerFlag.Status.IN_PROGRESS]
            ).count()

            student_list.append({
                "student_id": student.id,
                "student_name": student.get_full_name() or student.username,
                "email": student.email,
                "enrolled_at": enroll.enrolled_at,
                "attendance_rate": att_rate,
                "average_grade": round(avg_grade, 2) if avg_grade else None,
                "active_flags_count": open_flags,
            })

        return Response({
            "class_id": classroom.id,
            "class_title": classroom.title,
            "enrolled_count": len(student_list),
            "students": student_list
        }, status=status.HTTP_200_OK)
