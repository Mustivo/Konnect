from rest_framework import serializers
from .models import Assessment, Question, QuestionOption, AssessmentSubmission, StudentAnswer


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'explanation']


class StudentQuestionOptionSerializer(serializers.ModelSerializer):
    """Hidden is_correct flag for student testing"""
    class Meta:
        model = QuestionOption
        fields = ['id', 'text']


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'order', 'options']

    def get_options(self, obj):
        request = self.context.get('request', None)
        # If student or unauthenticated, hide correct answer
        if request and request.user.is_authenticated and (request.user.is_teacher_role or request.user.is_admin_role):
            return QuestionOptionSerializer(obj.options.all(), many=True).data
        return StudentQuestionOptionSerializer(obj.options.all(), many=True).data


class AssessmentListSerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    class_title = serializers.ReadOnlyField(source='class_room.title')

    class Meta:
        model = Assessment
        fields = [
            'id', 'class_room', 'class_title', 'title', 'description',
            'assessment_type', 'max_score', 'passing_score', 'duration_minutes',
            'due_date', 'is_in_session_quiz', 'is_published', 'questions_count',
            'created_at'
        ]


class AssessmentDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class_title = serializers.ReadOnlyField(source='class_room.title')
    teacher_name = serializers.ReadOnlyField(source='created_by.get_full_name')

    class Meta:
        model = Assessment
        fields = [
            'id', 'class_room', 'class_title', 'teacher_name', 'title',
            'description', 'assessment_type', 'max_score', 'passing_score',
            'duration_minutes', 'due_date', 'is_in_session_quiz',
            'live_session', 'is_published', 'questions', 'created_at'
        ]


class QuestionCreateSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'points', 'order', 'options']


class AssessmentCreateUpdateSerializer(serializers.ModelSerializer):
    questions = QuestionCreateSerializer(many=True, required=False)

    class Meta:
        model = Assessment
        fields = [
            'id', 'class_room', 'title', 'description', 'assessment_type',
            'max_score', 'passing_score', 'duration_minutes', 'due_date',
            'is_in_session_quiz', 'live_session', 'is_published', 'questions'
        ]

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        validated_data['created_by'] = self.context['request'].user
        assessment = Assessment.objects.create(**validated_data)

        for q_data in questions_data:
            options_data = q_data.pop('options', [])
            question = Question.objects.create(assessment=assessment, **q_data)
            for opt_data in options_data:
                QuestionOption.objects.create(question=question, **opt_data)

        return assessment


class StudentAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.ReadOnlyField(source='question.text')

    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'question_text', 'selected_option', 'text_answer', 'score_awarded', 'is_auto_graded']
        read_only_fields = ['id', 'score_awarded', 'is_auto_graded']


class AnswerInputSerializer(serializers.Serializer):
    question_id = serializers.UUIDField()
    selected_option_id = serializers.UUIDField(required=False, allow_null=True)
    text_answer = serializers.CharField(required=False, allow_blank=True, default='')


class AssessmentSubmitSerializer(serializers.Serializer):
    answers = AnswerInputSerializer(many=True)


class AssessmentSubmissionDetailSerializer(serializers.ModelSerializer):
    answers = StudentAnswerSerializer(many=True, read_only=True)
    assessment_title = serializers.ReadOnlyField(source='assessment.title')
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    learner_email = serializers.ReadOnlyField(source='learner.email')

    class Meta:
        model = AssessmentSubmission
        fields = [
            'id', 'assessment', 'assessment_title', 'learner', 'learner_name',
            'learner_email', 'started_at', 'submitted_at', 'total_score',
            'status', 'teacher_feedback', 'graded_at', 'answers'
        ]
        read_only_fields = ['id', 'started_at', 'submitted_at']


class TeacherGradingSerializer(serializers.Serializer):
    total_score = serializers.DecimalField(max_digits=6, decimal_places=2)
    teacher_feedback = serializers.CharField(required=False, allow_blank=True, default='')
