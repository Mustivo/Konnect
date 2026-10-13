from rest_framework import serializers
from .models import StudyGroup, StudyGroupMessage, StudyPlan, StudyPlanItem


class StudyGroupMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')

    class Meta:
        model = StudyGroupMessage
        fields = ['id', 'group', 'sender', 'sender_name', 'message', 'sent_at']
        read_only_fields = ['id', 'sender', 'sent_at']


class StudyGroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='created_by.get_full_name')
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'description', 'class_room', 'class_title',
            'created_by', 'creator_name', 'members', 'members_count',
            'is_private', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class StudyPlanItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlanItem
        fields = ['id', 'study_plan', 'title', 'due_date', 'is_completed', 'completed_at']
        read_only_fields = ['id', 'completed_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    items = StudyPlanItemSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = [
            'id', 'learner', 'title', 'description',
            'start_date', 'target_date', 'status', 'items',
            'progress_percentage', 'created_at'
        ]
        read_only_fields = ['id', 'learner', 'created_at']

    def get_progress_percentage(self, obj):
        total = obj.items.count()
        if total == 0:
            return 0.0
        done = obj.items.filter(is_completed=True).count()
        return round((done / total) * 100, 1)
