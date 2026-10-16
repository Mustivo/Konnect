from rest_framework import serializers
from .models import Badge, LearnerBadge, LearnerFlag


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'title', 'description', 'icon', 'category']


class LearnerBadgeSerializer(serializers.ModelSerializer):
    badge_title = serializers.ReadOnlyField(source='badge.title')
    badge_icon = serializers.ReadOnlyField(source='badge.icon')
    badge_description = serializers.ReadOnlyField(source='badge.description')
    teacher_name = serializers.ReadOnlyField(source='awarded_by.get_full_name')
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = LearnerBadge
        fields = [
            'id', 'badge', 'badge_title', 'badge_icon', 'badge_description',
            'learner', 'awarded_by', 'teacher_name', 'class_room', 'class_title',
            'note', 'awarded_at'
        ]
        read_only_fields = ['id', 'awarded_at']


class AwardBadgeInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerBadge
        fields = ['badge', 'learner', 'class_room', 'note']


class LearnerFlagSerializer(serializers.ModelSerializer):
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    learner_email = serializers.ReadOnlyField(source='learner.email')
    teacher_name = serializers.ReadOnlyField(source='teacher.get_full_name')
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = LearnerFlag
        fields = [
            'id', 'learner', 'learner_name', 'learner_email',
            'teacher', 'teacher_name', 'class_room', 'class_title',
            'category', 'severity', 'reason', 'action_plan',
            'status', 'created_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'teacher', 'created_at']


class LearnerFlagCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerFlag
        fields = ['learner', 'class_room', 'category', 'severity', 'reason', 'action_plan', 'status']
