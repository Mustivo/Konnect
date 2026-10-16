import uuid
from django.db import models
from django.conf import settings


class Assessment(models.Model):
    class AssessmentType(models.TextChoices):
        EXAM = 'EXAM', 'Exam'
        QUIZ = 'QUIZ', 'Quiz'
        EXERCISE = 'EXERCISE', 'Exercise'
        HOMEWORK = 'HOMEWORK', 'Homework'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class_room = models.ForeignKey(
        'classes.ClassRoom',
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_assessments'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assessment_type = models.CharField(
        max_length=20,
        choices=AssessmentType.choices,
        default=AssessmentType.QUIZ
    )
    max_score = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    passing_score = models.DecimalField(max_digits=6, decimal_places=2, default=50.00)
    duration_minutes = models.PositiveIntegerField(default=0, help_text="Duration in minutes (0 for unlimited)")
    due_date = models.DateTimeField(null=True, blank=True)
    is_in_session_quiz = models.BooleanField(
        default=False,
        help_text="Set true for live classroom quick quizzes / polls"
    )
    live_session = models.ForeignKey(
        'live_sessions.LiveSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='in_session_assessments'
    )
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.assessment_type}] {self.title} - {self.class_room.title}"


class Question(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        TRUE_FALSE = 'TRUE_FALSE', 'True / False'
        SHORT_ANSWER = 'SHORT_ANSWER', 'Short Answer'
        ESSAY = 'ESSAY', 'Essay'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.MCQ
    )
    points = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]} ({self.points} pts)"


class QuestionOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='options'
    )
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.text} ({'Correct' if self.is_correct else 'Incorrect'})"


class AssessmentSubmission(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        SUBMITTED = 'SUBMITTED', 'Submitted'
        GRADED = 'GRADED', 'Graded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    learner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assessment_submissions'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED
    )
    teacher_feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='graded_submissions'
    )
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('assessment', 'learner')
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.learner.email} - {self.assessment.title} ({self.total_score}/{self.assessment.max_score})"


class StudentAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        AssessmentSubmission,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    selected_option = models.ForeignKey(
        QuestionOption,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    text_answer = models.TextField(blank=True)
    score_awarded = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_auto_graded = models.BooleanField(default=False)

    def __str__(self):
        return f"Ans for {self.question.id} ({self.score_awarded} pts)"
