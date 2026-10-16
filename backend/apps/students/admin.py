from django.contrib import admin
from .models import Badge, LearnerBadge, LearnerFlag


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'icon', 'created_at')
    search_fields = ('title', 'category')


@admin.register(LearnerBadge)
class LearnerBadgeAdmin(admin.ModelAdmin):
    list_display = ('badge', 'learner', 'awarded_by', 'class_room', 'awarded_at')
    list_filter = ('badge__category',)
    search_fields = ('learner__email', 'badge__title')


@admin.register(LearnerFlag)
class LearnerFlagAdmin(admin.ModelAdmin):
    list_display = ('learner', 'teacher', 'class_room', 'category', 'severity', 'status', 'created_at')
    list_filter = ('category', 'severity', 'status')
    search_fields = ('learner__email', 'teacher__email', 'reason')
