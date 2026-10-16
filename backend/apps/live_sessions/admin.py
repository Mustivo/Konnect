from django.contrib import admin
from .models import LiveSession, SessionAttendance, SessionChatMessage


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'class_room', 'status', 'scheduled_start', 'scheduled_end', 'room_id')
    list_filter = ('status', 'scheduled_start')
    search_fields = ('title', 'class_room__title', 'room_id')


@admin.register(SessionAttendance)
class SessionAttendanceAdmin(admin.ModelAdmin):
    list_display = ('session', 'learner', 'status', 'joined_at', 'duration_seconds')
    list_filter = ('status',)
    search_fields = ('session__title', 'learner__email')


@admin.register(SessionChatMessage)
class SessionChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'sender', 'message', 'is_pinned', 'sent_at')
    search_fields = ('session__title', 'sender__email', 'message')
