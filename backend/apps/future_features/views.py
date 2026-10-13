from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import PaymentRecord, FinancialSummaryReport, AIAssistantSession
from .serializers import (
    PaymentRecordSerializer,
    FinancialSummaryReportSerializer,
    AIAssistantSessionSerializer,
)
from apps.accounts.permissions import IsAdminUserRole


class PaymentListCreateView(generics.ListCreateAPIView):
    """
    Admin flow: Payment Management
    Learner flow: Make class tuition/resource payments
    """
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return PaymentRecord.objects.all()
        return PaymentRecord.objects.filter(payer=user)

    def perform_create(self, serializer):
        serializer.save(payer=self.request.user, status=PaymentRecord.Status.COMPLETED)


class FinancialReportsListView(generics.ListAPIView):
    """
    Admin flow: Financial reports
    """
    serializer_class = FinancialSummaryReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUserRole]
    queryset = FinancialSummaryReport.objects.all()


class AIAssistantInteractionView(APIView):
    """
    Teacher flow: AI Tools (quiz generator, lesson plan)
    Learner flow: AI Study Assistant (summarization, concept Q&A)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AIAssistantSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prompt = serializer.validated_data['prompt']
        tool_mode = serializer.validated_data.get('tool_mode', AIAssistantSession.ToolMode.STUDY_ASSISTANT)
        context_class = serializer.validated_data.get('context_class', None)

        # Generative AI Mock response engine
        if tool_mode == AIAssistantSession.ToolMode.STUDY_ASSISTANT:
            ai_reply = (
                f"Hello! I am your KONNECT AI Study Assistant. Regarding '{prompt[:80]}...': "
                f"Here is a structured explanation:\n\n"
                f"1. Core Concept: Review the fundamental principles.\n"
                f"2. Key Takeaway: Practice related exercise sets in your class.\n"
                f"3. Recommendation: Check your live classroom recording for further context!"
            )
        elif tool_mode == AIAssistantSession.ToolMode.TEACHER_QUIZ_GEN:
            ai_reply = (
                f"KONNECT Teacher AI generated a draft quiz on '{prompt[:80]}':\n\n"
                f"Question 1: What is the main characteristic of {prompt[:30]}?\n"
                f"- A) Option 1 (Correct)\n- B) Option 2\n- C) Option 3\n- D) Option 4\n\n"
                f"Question 2: True or False: This concept applies universally in this subject?"
            )
        else:
            ai_reply = f"KONNECT AI Lesson Plan ready for: {prompt[:100]}."

        session = AIAssistantSession.objects.create(
            user=request.user,
            tool_mode=tool_mode,
            prompt=prompt,
            ai_response=ai_reply,
            context_class=context_class
        )

        return Response(AIAssistantSessionSerializer(session).data, status=status.HTTP_201_CREATED)
