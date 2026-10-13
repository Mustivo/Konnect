from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import TeacherProfile, LearnerProfile, AdminProfile, AuditLog

User = get_user_model()


class TeacherProfileSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.ReadOnlyField(source='verified_by.get_full_name')

    class Meta:
        model = TeacherProfile
        fields = [
            'id', 'bio', 'qualifications', 'expertise_subjects',
            'verification_status', 'verification_document', 'verification_notes',
            'verified_at', 'verified_by', 'verified_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'verification_status', 'verified_at', 'verified_by', 'created_at']


class LearnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerProfile
        fields = [
            'id', 'date_of_birth', 'grade_level', 'learning_goals',
            'interests', 'parent_guardian_name', 'parent_guardian_phone', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['id', 'department', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    teacher_profile = TeacherProfileSerializer(read_only=True)
    learner_profile = LearnerProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'phone_number', 'avatar', 'is_verified',
            'date_joined', 'teacher_profile', 'learner_profile', 'admin_profile'
        ]
        read_only_fields = ['id', 'date_joined', 'is_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'role', 'phone_number', 'password', 'password_confirm'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.get('role', User.Role.LEARNER)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Automatically create matching profile
        if role == User.Role.TEACHER:
            TeacherProfile.objects.create(user=user)
        elif role == User.Role.LEARNER:
            LearnerProfile.objects.create(user=user)
        elif role == User.Role.ADMIN:
            AdminProfile.objects.create(user=user)

        return user


class TeacherVerificationActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    verification_notes = serializers.CharField(required=False, allow_blank=True)


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.ReadOnlyField(source='actor.email')
    actor_name = serializers.ReadOnlyField(source='actor.get_full_name')

    class Meta:
        model = AuditLog
        fields = [
            'id', 'actor', 'actor_email', 'actor_name', 'action',
            'target_model', 'target_id', 'ip_address', 'details', 'timestamp'
        ]
        read_only_fields = [
            'id', 'actor', 'actor_email', 'actor_name', 'action',
            'target_model', 'target_id', 'ip_address', 'details', 'timestamp'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
