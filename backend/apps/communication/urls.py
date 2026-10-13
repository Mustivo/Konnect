from django.urls import path
from .views import (
    AnnouncementListCreateView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    SupportTicketListCreateView,
    SupportTicketDetailView,
    SupportTicketReplyView,
    UnifiedCalendarEventsView,
)

urlpatterns = [
    # Announcements
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcements-list-create'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/<uuid:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notifications-mark-all-read'),

    # Support Tickets
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-tickets-list-create'),
    path('support/tickets/<uuid:id>/', SupportTicketDetailView.as_view(), name='support-ticket-detail'),
    path('support/tickets/<uuid:pk>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),

    # Calendar
    path('calendar/events/', UnifiedCalendarEventsView.as_view(), name='calendar-events'),
]
