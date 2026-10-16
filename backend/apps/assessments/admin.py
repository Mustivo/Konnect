from django.contrib import admin
from .models import Assessment, Question, QuestionOption, AssessmentSubmission, StudentAnswer


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 2


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('order', 'assessment', 'question_type', 'points', 'text')
    list_filter = ('question_type',)
    inlines = [QuestionOptionInline]


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'class_room', 'assessment_type', 'max_score', 'passing_score', 'due_date', 'is_published')
    list_filter = ('assessment_type', 'is_published')
    search_fields = ('title', 'class_room__title')
    inlines = [QuestionInline]


@admin.register(AssessmentSubmission)
class AssessmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'learner', 'total_score', 'status', 'submitted_at', 'graded_at')
    list_filter = ('status',)
    search_fields = ('assessment__title', 'learner__email')


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('submission', 'question', 'score_awarded', 'is_auto_graded')
