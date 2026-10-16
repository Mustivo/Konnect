from rest_framework import serializers
from .models import PlatformHealthMetric


class PlatformHealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformHealthMetric
        fields = ['id', 'service_name', 'status', 'response_time_ms', 'details', 'checked_at']
