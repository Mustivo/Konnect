import uuid
from django.db import models
from django.conf import settings


class Badge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='award', help_text="Icon identifier (e.g. star, trophy, medal)")
    category = models.CharField(max_length=50, default='PARTICIPATION')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class LearnerBadge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_instances')
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='badges'
    )
    awarded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='awarded_badges'
    )
    class_room = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='awarded_badges'
    )
    note = models.TextField(blank=True)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-awarded_at']

    def __str__(self):
        return f"{self.badge.title} -> {self.learner.email}"


class LearnerFlag(models.Model):
    class Category(models.TextChoices):
        ATTENDANCE = 'ATTENDANCE', 'Attendance Issue'
        ACADEMIC = 'ACADEMIC', 'Academic Struggle'
        BEHAVIORAL = 'BEHAVIORAL', 'Behavioral Concern'
        IMPROVEMENT = 'IMPROVEMENT', 'Improvement Opportunity'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='flags'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='issued_flags'
    )
    class_room = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.CASCADE,
        related_name='learner_flags'
    )
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.ACADEMIC
    )
    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.MEDIUM
    )
    reason = models.TextField()
    action_plan = models.TextField(
        blank=True,
        help_text="Manage & Improve intervention steps"
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"FLAG: {self.learner.email} ({self.severity}) by {self.teacher.email}"
