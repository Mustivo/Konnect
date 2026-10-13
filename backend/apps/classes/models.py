import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class ClassRoom(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = 'PUBLIC', 'Public'
        PRIVATE = 'PRIVATE', 'Private'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    subject = models.CharField(max_length=100, blank=True)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teaching_classes'
    )
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    max_students = models.PositiveIntegerField(
        default=50,
        help_text="Class student limit"
    )
    enrollment_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        help_text="Unique code to join the class"
    )
    banner_image = models.ImageField(upload_to='class_banners/', blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.visibility}) - {self.teacher.email}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'class'
            random_str = secrets.token_hex(3)
            self.slug = f"{base_slug}-{random_str}"
        if not self.enrollment_code:
            self.enrollment_code = secrets.token_hex(4).upper()
        super().save(*args, **kwargs)

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status=Enrollment.Status.ENROLLED).count()

    @property
    def is_full(self):
        return self.enrolled_count >= self.max_students

    @property
    def average_rating(self):
        avg = self.ratings.aggregate(models.Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else None


class ClassSchedule(models.Model):
    class DayOfWeek(models.TextChoices):
        MONDAY = 'MONDAY', 'Monday'
        TUESDAY = 'TUESDAY', 'Tuesday'
        WEDNESDAY = 'WEDNESDAY', 'Wednesday'
        THURSDAY = 'THURSDAY', 'Thursday'
        FRIDAY = 'FRIDAY', 'Friday'
        SATURDAY = 'SATURDAY', 'Saturday'
        SUNDAY = 'SUNDAY', 'Sunday'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=15, choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_notes = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.class_room.title}: {self.day_of_week} {self.start_time}-{self.end_time}"


class Enrollment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ENROLLED = 'ENROLLED', 'Enrolled'
        DROPPED = 'DROPPED', 'Dropped'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='enrollments')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='class_enrollments')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENROLLED)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_room', 'learner')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.learner.email} enrolled in {self.class_room.title} ({self.status})"


class ClassRating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='ratings')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_ratings')
    rating = models.PositiveSmallIntegerField(
        choices=[(i, f"{i} Stars") for i in range(1, 6)]
    )
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_room', 'learner')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}* by {self.learner.email} for {self.class_room.title}"
