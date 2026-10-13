import uuid
import secrets
from django.db import models
from django.conf import settings


class PaymentRecord(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    class_room = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    payment_method = models.CharField(max_length=50, blank=True, default='Mobile Money / Card')
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = f"TXN-{secrets.token_hex(6).upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.transaction_id} - {self.payer.email} ({self.amount} {self.currency})"


class FinancialSummaryReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    period_start = models.DateField()
    period_end = models.DateField()
    gross_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    teacher_payouts = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    net_platform_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.period_start} to {self.period_end})"


class AIAssistantSession(models.Model):
    class ToolMode(models.TextChoices):
        STUDY_ASSISTANT = 'STUDY_ASSISTANT', 'Learner AI Study Assistant'
        TEACHER_QUIZ_GEN = 'TEACHER_QUIZ_GEN', 'Teacher AI Quiz Generator'
        TEACHER_LESSON_PLAN = 'TEACHER_LESSON_PLAN', 'Teacher AI Lesson Planner'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_sessions'
    )
    tool_mode = models.CharField(
        max_length=30,
        choices=ToolMode.choices,
        default=ToolMode.STUDY_ASSISTANT
    )
    prompt = models.TextField()
    ai_response = models.TextField()
    context_class = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.tool_mode}"
