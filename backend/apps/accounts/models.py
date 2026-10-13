import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        LEARNER = 'LEARNER', 'Learner'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.LEARNER)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_teacher_role(self):
        return self.role == self.Role.TEACHER

    @property
    def is_learner_role(self):
        return self.role == self.Role.LEARNER


class TeacherProfile(models.Model):
    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    bio = models.TextField(blank=True)
    qualifications = models.TextField(blank=True, help_text="Certifications, degrees, experiences")
    expertise_subjects = models.CharField(max_length=255, blank=True)
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verification_document = models.FileField(upload_to='teacher_verifications/', blank=True, null=True)
    verification_notes = models.TextField(blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_teachers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TeacherProfile: {self.user.email} - {self.verification_status}"


class LearnerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learner_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    grade_level = models.CharField(max_length=50, blank=True)
    learning_goals = models.TextField(blank=True)
    interests = models.CharField(max_length=255, blank=True)
    parent_guardian_name = models.CharField(max_length=150, blank=True)
    parent_guardian_phone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LearnerProfile: {self.user.email} ({self.grade_level})"


class AdminProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, default='Administration')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AdminProfile: {self.user.email} - {self.department}"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_actions')
    action = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.actor} - {self.action} on {self.target_model}"
