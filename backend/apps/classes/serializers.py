from rest_framework import serializers
from .models import ClassRoom, ClassSchedule, Enrollment, ClassRating


class ClassScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSchedule
        fields = ['id', 'day_of_week', 'start_time', 'end_time', 'room_notes']


class ClassRatingSerializer(serializers.ModelSerializer):
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    learner_email = serializers.ReadOnlyField(source='learner.email')

    class Meta:
        model = ClassRating
        fields = ['id', 'class_room', 'learner', 'learner_name', 'learner_email', 'rating', 'review', 'created_at']
        read_only_fields = ['id', 'learner', 'created_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    class_title = serializers.ReadOnlyField(source='class_room.title')
    class_subject = serializers.ReadOnlyField(source='class_room.subject')
    teacher_name = serializers.ReadOnlyField(source='class_room.teacher.get_full_name')
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    learner_email = serializers.ReadOnlyField(source='learner.email')

    class Meta:
        model = Enrollment
        fields = [
            'id', 'class_room', 'class_title', 'class_subject',
            'teacher_name', 'learner', 'learner_name', 'learner_email',
            'status', 'enrolled_at'
        ]
        read_only_fields = ['id', 'learner', 'enrolled_at']


class ClassRoomListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.get_full_name')
    enrolled_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'title', 'slug', 'description', 'subject', 'teacher',
            'teacher_name', 'visibility', 'status', 'max_students',
            'enrolled_count', 'is_full', 'average_rating', 'banner_image',
            'start_date', 'end_date', 'created_at'
        ]


class ClassRoomDetailSerializer(serializers.ModelSerializer):
    teacher_name = serializers.ReadOnlyField(source='teacher.get_full_name')
    schedules = ClassScheduleSerializer(many=True, read_only=True)
    ratings = ClassRatingSerializer(many=True, read_only=True)
    enrolled_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'title', 'slug', 'description', 'subject', 'teacher',
            'teacher_name', 'visibility', 'status', 'max_students',
            'enrollment_code', 'enrolled_count', 'is_full', 'average_rating',
            'banner_image', 'start_date', 'end_date', 'schedules',
            'ratings', 'created_at', 'updated_at'
        ]


class ClassRoomCreateUpdateSerializer(serializers.ModelSerializer):
    schedules = ClassScheduleSerializer(many=True, required=False)

    class Meta:
        model = ClassRoom
        fields = [
            'id', 'title', 'description', 'subject', 'visibility',
            'status', 'max_students', 'banner_image', 'start_date',
            'end_date', 'schedules'
        ]

    def create(self, validated_data):
        schedules_data = validated_data.pop('schedules', [])
        # Set teacher from request context
        validated_data['teacher'] = self.context['request'].user
        classroom = ClassRoom.objects.create(**validated_data)
        for sched in schedules_data:
            ClassSchedule.objects.create(class_room=classroom, **sched)
        return classroom

    def update(self, instance, validated_data):
        schedules_data = validated_data.pop('schedules', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if schedules_data is not None:
            instance.schedules.all().delete()
            for sched in schedules_data:
                ClassSchedule.objects.create(class_room=instance, **sched)
        return instance


class JoinClassByCodeSerializer(serializers.Serializer):
    enrollment_code = serializers.CharField(max_length=20, required=True)
