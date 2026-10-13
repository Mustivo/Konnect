from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from decimal import Decimal
from .models import Assessment, Question, QuestionOption, AssessmentSubmission, StudentAnswer
from .serializers import (
    AssessmentListSerializer,
    AssessmentDetailSerializer,
    AssessmentCreateUpdateSerializer,
    AssessmentSubmitSerializer,
    AssessmentSubmissionDetailSerializer,
    TeacherGradingSerializer,
)
from apps.accounts.permissions import IsTeacherOrAdmin, IsTeacherRole, IsLearnerRole
from apps.classes.models import ClassRoom, Enrollment


class ClassAssessmentListCreateView(generics.ListCreateAPIView):
    """
    Teacher flow: Assignments -> Create Exam, Create Quiz, Exercise
    Learner flow: View class assignments
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssessmentCreateUpdateSerializer
        return AssessmentListSerializer

    def get_queryset(self):
        class_id = self.kwargs['class_id']
        qs = Assessment.objects.filter(class_room_id=class_id)
        if not (self.request.user.is_teacher_role or self.request.user.is_admin_role):
            qs = qs.filter(is_published=True)
        return qs

    def perform_create(self, serializer):
        class_id = self.kwargs['class_id']
        classroom = ClassRoom.objects.get(pk=class_id)
        if classroom.teacher != self.request.user and not self.request.user.is_admin_role:
            raise permissions.PermissionDenied("Only the class teacher can create assessments.")
        serializer.save(class_room=classroom)


class AssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Learner flow: Take Exam / Answer Quiz
    Teacher flow: Edit Exam / Quiz
    """
    queryset = Assessment.objects.all()
    lookup_field = 'id'
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AssessmentCreateUpdateSerializer
        return AssessmentDetailSerializer


from drf_spectacular.utils import extend_schema


class SubmitAssessmentView(APIView):
    """
    Learner flow: Live Classroom -> Answer Quiz / Take Exam or Assignment submit.
    Supports auto-grading for multiple choice and true/false questions.
    """
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    @extend_schema(
        request=AssessmentSubmitSerializer,
        responses={200: AssessmentSubmissionDetailSerializer},
        summary="Submit Assessment Answers",
        description="Learner submits answers for Exam, Quiz, or Exercise. Automatically scores MCQ & True/False questions."
    )
    def post(self, request, pk):
        try:
            assessment = Assessment.objects.get(pk=pk, is_published=True)
        except Assessment.DoesNotExist:
            return Response({"detail": "Assessment not found or not published."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssessmentSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission, _ = AssessmentSubmission.objects.get_or_create(
            assessment=assessment,
            learner=request.user,
            defaults={'started_at': timezone.now()}
        )

        total_auto_score = Decimal('0.00')
        all_auto_graded = True

        for item in serializer.validated_data['answers']:
            q_id = item['question_id']
            opt_id = item.get('selected_option_id')
            txt_ans = item.get('text_answer', '')

            try:
                question = Question.objects.get(pk=q_id, assessment=assessment)
            except Question.DoesNotExist:
                continue

            score_awarded = Decimal('0.00')
            is_auto = False
            selected_opt = None

            if opt_id:
                try:
                    selected_opt = QuestionOption.objects.get(pk=opt_id, question=question)
                    if selected_opt.is_correct:
                        score_awarded = question.points
                    is_auto = True
                    total_auto_score += score_awarded
                except QuestionOption.DoesNotExist:
                    pass
            else:
                if question.question_type in [Question.QuestionType.MCQ, Question.QuestionType.TRUE_FALSE]:
                    is_auto = True
                else:
                    all_auto_graded = False

            StudentAnswer.objects.update_or_create(
                submission=submission,
                question=question,
                defaults={
                    'selected_option': selected_opt,
                    'text_answer': txt_ans,
                    'score_awarded': score_awarded,
                    'is_auto_graded': is_auto,
                }
            )

        submission.submitted_at = timezone.now()
        if all_auto_graded:
            submission.total_score = total_auto_score
            submission.status = AssessmentSubmission.Status.GRADED
        else:
            submission.status = AssessmentSubmission.Status.SUBMITTED
            submission.total_score = total_auto_score
        submission.save()

        return Response(AssessmentSubmissionDetailSerializer(submission).data, status=status.HTTP_200_OK)


class LearnerSubmissionsListView(generics.ListAPIView):
    """
    Learner flow: Progress & Grades -> View assignment & quiz submissions
    """
    serializer_class = AssessmentSubmissionDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsLearnerRole]

    def get_queryset(self):
        return AssessmentSubmission.objects.filter(learner=self.request.user)


class TeacherAssessmentSubmissionsListView(generics.ListAPIView):
    """
    Teacher flow: Student Management -> View learner submissions for an assessment
    """
    serializer_class = AssessmentSubmissionDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    def get_queryset(self):
        assessment_id = self.kwargs['assessment_id']
        return AssessmentSubmission.objects.filter(assessment_id=assessment_id).select_related('learner')


class TeacherGradeSubmissionView(APIView):
    """
    Teacher flow: Student Management -> Grade submission and provide feedback
    """
    permission_classes = [permissions.IsAuthenticated, IsTeacherOrAdmin]

    @extend_schema(
        request=TeacherGradingSerializer,
        responses={200: AssessmentSubmissionDetailSerializer},
        summary="Grade Learner Submission",
        description="Teacher assigns score and feedback to a student submission."
    )
    def post(self, request, pk):
        try:
            submission = AssessmentSubmission.objects.get(pk=pk)
        except AssessmentSubmission.DoesNotExist:
            return Response({"detail": "Submission not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TeacherGradingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission.total_score = serializer.validated_data['total_score']
        submission.teacher_feedback = serializer.validated_data.get('teacher_feedback', '')
        submission.status = AssessmentSubmission.Status.GRADED
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.save()

        return Response(AssessmentSubmissionDetailSerializer(submission).data, status=status.HTTP_200_OK)
