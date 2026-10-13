from rest_framework import serializers
from .models import Announcement, Notification, SupportTicket, SupportTicketMessage


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'author', 'author_name',
            'class_room', 'class_title', 'priority', 'created_at'
        ]
        read_only_fields = ['id', 'author', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'message',
            'notification_type', 'is_read', 'action_url', 'created_at'
        ]
        read_only_fields = ['id', 'recipient', 'created_at']


class SupportTicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')
    sender_email = serializers.ReadOnlyField(source='sender.email')

    class Meta:
        model = SupportTicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'sender_email', 'message', 'is_staff', 'created_at']
        read_only_fields = ['id', 'sender', 'is_staff', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    replies = SupportTicketMessageSerializer(many=True, read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'user_email', 'subject', 'description',
            'priority', 'status', 'created_at', 'updated_at', 'replies'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
