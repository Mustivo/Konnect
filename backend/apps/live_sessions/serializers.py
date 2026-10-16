from rest_framework import serializers
from .models import LiveSession, SessionAttendance, SessionChatMessage


class SessionChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')
    sender_role = serializers.ReadOnlyField(source='sender.role')

    class Meta:
        model = SessionChatMessage
        fields = ['id', 'session', 'sender', 'sender_name', 'sender_role', 'message', 'is_pinned', 'sent_at']
        read_only_fields = ['id', 'sender', 'sent_at']


class SessionAttendanceSerializer(serializers.ModelSerializer):
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    learner_email = serializers.ReadOnlyField(source='learner.email')
    session_title = serializers.ReadOnlyField(source='session.title')

    class Meta:
        model = SessionAttendance
        fields = [
            'id', 'session', 'session_title', 'learner',
            'learner_name', 'learner_email', 'joined_at',
            'left_at', 'duration_seconds', 'status'
        ]
        read_only_fields = ['id', 'learner', 'joined_at']


class LiveSessionSerializer(serializers.ModelSerializer):
    class_title = serializers.ReadOnlyField(source='class_room.title')
    teacher_name = serializers.ReadOnlyField(source='class_room.teacher.get_full_name')
    attendances_count = serializers.SerializerMethodField()

    class Meta:
        model = LiveSession
        fields = [
            'id', 'class_room', 'class_title', 'teacher_name',
            'title', 'agenda', 'scheduled_start', 'scheduled_end',
            'actual_start', 'actual_end', 'status', 'room_id',
            'meeting_url', 'recording_url', 'attendances_count', 'created_at'
        ]
        read_only_fields = ['id', 'actual_start', 'actual_end', 'created_at']

    def get_attendances_count(self, obj):
        return obj.attendances.count()
