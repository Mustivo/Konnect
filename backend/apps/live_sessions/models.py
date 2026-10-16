import uuid
import secrets
from django.db import models
from django.conf import settings


class LiveSession(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        LIVE = 'LIVE', 'Live'
        ENDED = 'ENDED', 'Ended'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_room = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.CASCADE,
        related_name='live_sessions'
    )
    title = models.CharField(max_length=200)
    agenda = models.TextField(blank=True)
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )
    room_id = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="Virtual classroom unique room ID"
    )
    meeting_url = models.URLField(max_length=500, blank=True)
    recording_url = models.URLField(max_length=500, blank=True, help_text="Post-class playback recording link")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-scheduled_start']

    def __str__(self):
        return f"{self.title} ({self.status}) - {self.class_room.title}"

    def save(self, *args, **kwargs):
        if not self.room_id:
            self.room_id = f"konnect-room-{secrets.token_urlsafe(8)}"
        super().save(*args, **kwargs)


class SessionAttendance(models.Model):
    class AttendanceStatus(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        LATE = 'LATE', 'Late'
        ABSENT = 'ABSENT', 'Absent'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        LiveSession,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_attendances'
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.PRESENT
    )

    class Meta:
        unique_together = ('session', 'learner')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.learner.email} at {self.session.title}: {self.status}"


class SessionChatMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        LiveSession,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_chat_messages'
    )
    message = models.TextField()
    is_pinned = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"[{self.sent_at.strftime('%H:%M')}] {self.sender.username}: {self.message[:30]}"
