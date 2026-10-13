from rest_framework import serializers
from .models import PaymentRecord, FinancialSummaryReport, AIAssistantSession


class PaymentRecordSerializer(serializers.ModelSerializer):
    payer_email = serializers.ReadOnlyField(source='payer.email')
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = PaymentRecord
        fields = [
            'id', 'payer', 'payer_email', 'class_room', 'class_title',
            'amount', 'currency', 'status', 'payment_method',
            'transaction_id', 'created_at'
        ]
        read_only_fields = ['id', 'payer', 'transaction_id', 'created_at']


class FinancialSummaryReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialSummaryReport
        fields = '__all__'


class AIAssistantSessionSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = AIAssistantSession
        fields = ['id', 'user', 'user_email', 'tool_mode', 'prompt', 'ai_response', 'context_class', 'created_at']
        read_only_fields = ['id', 'user', 'ai_response', 'created_at']
