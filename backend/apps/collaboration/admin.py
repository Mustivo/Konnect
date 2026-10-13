from django.contrib import admin
from .models import StudyGroup, StudyGroupMessage, StudyPlan, StudyPlanItem


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_room', 'created_by', 'is_private', 'created_at')
    search_fields = ('name', 'class_room__title', 'created_by__email')


@admin.register(StudyGroupMessage)
class StudyGroupMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'sender', 'sent_at')


class StudyPlanItemInline(admin.TabularInline):
    model = StudyPlanItem
    extra = 1


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'learner', 'target_date', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'learner__email')
    inlines = [StudyPlanItemInline]
