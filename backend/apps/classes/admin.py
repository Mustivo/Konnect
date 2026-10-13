from django.contrib import admin
from .models import ClassRoom, ClassSchedule, Enrollment, ClassRating


class ClassScheduleInline(admin.TabularInline):
    model = ClassSchedule
    extra = 1


@admin.register(ClassRoom)
class ClassRoomAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'visibility', 'status', 'max_students', 'enrollment_code', 'created_at')
    list_filter = ('visibility', 'status', 'subject')
    search_fields = ('title', 'description', 'teacher__email', 'enrollment_code')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ClassScheduleInline]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('class_room', 'learner', 'status', 'enrolled_at')
    list_filter = ('status',)
    search_fields = ('class_room__title', 'learner__email')


@admin.register(ClassRating)
class ClassRatingAdmin(admin.ModelAdmin):
    list_display = ('class_room', 'learner', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('class_room__title', 'learner__email', 'review')
