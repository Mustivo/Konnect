from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Announcement, Notification, SupportTicket, SupportTicketMessage
from .serializers import (
    AnnouncementSerializer,
    NotificationSerializer,
    SupportTicketSerializer,
    SupportTicketMessageSerializer,
)
from apps.accounts.permissions import IsAdminUserRole, IsTeacherOrAdmin
from apps.live_sessions.models import LiveSession
from apps.assessments.models import Assessment
from apps.classes.models import Enrollment, ClassRoom


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    Teacher flow: Announcement
    Learner flow: View class & global announcements
    """
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return Announcement.objects.all()

        if user.is_teacher_role:
            return Announcement.objects.filter(
                Q(author=user) | Q(class_room__isnull=True)
            )

        # Learner
        enrolled_class_ids = Enrollment.objects.filter(
            learner=user,
            status=Enrollment.Status.ENROLLED
        ).values_list('class_room_id', flat=True)

        return Announcement.objects.filter(
            Q(class_room__isnull=True) | Q(class_room_id__in=enrolled_class_ids)
        )

    def perform_create(self, serializer):
        if not (self.request.user.is_teacher_role or self.request.user.is_admin_role):
            raise permissions.PermissionDenied("Only teachers and admins can create announcements.")
        serializer.save(author=self.request.user)


class NotificationListView(generics.ListAPIView):
    """
    User flow: Notifications for Admin, Teacher, and Learner
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({"detail": "All notifications marked as read."}, status=status.HTTP_200_OK)


class SupportTicketListCreateView(generics.ListCreateAPIView):
    """
    Admin flow: Support (manage all support tickets)
    Learner / Teacher flow: Create ticket / view own tickets
    """
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin_role:
            status_param = self.request.query_params.get('status')
            qs = SupportTicket.objects.all()
            if status_param:
                qs = qs.filter(status=status_param.upper())
            return qs
        return SupportTicket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SupportTicketDetailView(generics.RetrieveUpdateAPIView):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class SupportTicketReplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            ticket = SupportTicket.objects.get(pk=pk)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({"detail": "Message cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = request.user.is_admin_role

        reply = SupportTicketMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            message=message_text,
            is_staff=is_staff
        )

        # If admin replies, update status
        if is_staff and ticket.status == SupportTicket.Status.OPEN:
            ticket.status = SupportTicket.Status.IN_PROGRESS
            ticket.save()

        return Response(SupportTicketMessageSerializer(reply).data, status=status.HTTP_201_CREATED)


class UnifiedCalendarEventsView(APIView):
    """
    Teacher & Learner flow: Calendar
    Returns scheduled live sessions and assignment due dates formatted for calendar display.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        events = []

        if user.is_teacher_role:
            # Teacher's scheduled sessions
            teacher_classes = ClassRoom.objects.filter(teacher=user)
            sessions = LiveSession.objects.filter(class_room__in=teacher_classes)
            for sess in sessions:
                events.append({
                    "id": sess.id,
                    "title": f"Live Class: {sess.title}",
                    "type": "SESSION",
                    "class_title": sess.class_room.title,
                    "start": sess.scheduled_start,
                    "end": sess.scheduled_end,
                    "status": sess.status,
                    "meeting_url": sess.meeting_url
                })

            # Teacher's assignment deadlines
            assessments = Assessment.objects.filter(class_room__in=teacher_classes, due_date__isnull=False)
            for ass in assessments:
                events.append({
                    "id": ass.id,
                    "title": f"Due: {ass.title} ({ass.assessment_type})",
                    "type": "ASSIGNMENT_DUE",
                    "class_title": ass.class_room.title,
                    "start": ass.due_date,
                    "end": ass.due_date,
                    "status": "PUBLISHED" if ass.is_published else "DRAFT"
                })

        else:
            # Learner calendar
            enrolled_classes = Enrollment.objects.filter(
                learner=user,
                status=Enrollment.Status.ENROLLED
            ).values_list('class_room_id', flat=True)

            sessions = LiveSession.objects.filter(class_room_id__in=enrolled_classes)
            for sess in sessions:
                events.append({
                    "id": sess.id,
                    "title": f"Live Class: {sess.title}",
                    "type": "SESSION",
                    "class_title": sess.class_room.title,
                    "start": sess.scheduled_start,
                    "end": sess.scheduled_end,
                    "status": sess.status,
                    "room_id": sess.room_id
                })

            assessments = Assessment.objects.filter(
                class_room_id__in=enrolled_classes,
                is_published=True,
                due_date__isnull=False
            )
            for ass in assessments:
                events.append({
                    "id": ass.id,
                    "title": f"Due: {ass.title} ({ass.assessment_type})",
                    "type": "ASSIGNMENT_DUE",
                    "class_title": ass.class_room.title,
                    "start": ass.due_date,
                    "end": ass.due_date
                })

        return Response({"events": events}, status=status.HTTP_200_OK)
