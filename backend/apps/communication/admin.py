from django.contrib import admin
from .models import Announcement, Notification, SupportTicket, SupportTicketMessage


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'class_room', 'priority', 'created_at')
    list_filter = ('priority',)
    search_fields = ('title', 'content')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('recipient__email', 'title', 'message')


class SupportTicketMessageInline(admin.TabularInline):
    model = SupportTicketMessage
    extra = 1


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority')
    search_fields = ('subject', 'description', 'user__email')
    inlines = [SupportTicketMessageInline]
