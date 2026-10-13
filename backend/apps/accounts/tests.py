from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.classes.models import ClassRoom, Enrollment
from apps.live_sessions.models import LiveSession
from apps.assessments.models import Assessment, Question, QuestionOption, AssessmentSubmission

User = get_user_model()


class KonnectBackendIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Admin
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role=User.Role.ADMIN,
            is_staff=True,
            is_verified=True
        )

        # Create Teacher
        self.teacher_user = User.objects.create_user(
            username='teacher_test',
            email='teacher@test.com',
            password='Password123!',
            role=User.Role.TEACHER,
            is_verified=True
        )

        # Create Learner
        self.learner_user = User.objects.create_user(
            username='learner_test',
            email='learner@test.com',
            password='Password123!',
            role=User.Role.LEARNER,
            is_verified=True
        )

    def test_user_registration(self):
        url = reverse('auth-register')
        payload = {
            'email': 'newlearner@test.com',
            'username': 'newlearner',
            'password': 'Password123!',
            'password_confirm': 'Password123!',
            'role': 'LEARNER'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newlearner@test.com').exists())

    def test_jwt_login(self):
        url = reverse('token-obtain-pair')
        payload = {
            'email': 'teacher@test.com',
            'password': 'Password123!'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_teacher_create_class_and_learner_enrollment(self):
        self.client.force_authenticate(user=self.teacher_user)
        url = reverse('teacher-classes-list-create')
        class_payload = {
            'title': 'Test Physics 101',
            'description': 'Exploring dynamics and energy',
            'subject': 'Physics',
            'visibility': 'PUBLIC',
            'status': 'ACTIVE',
            'max_students': 25
        }
        response = self.client.post(url, class_payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        class_id = response.data['id']

        # Authenticate as learner and enroll
        self.client.force_authenticate(user=self.learner_user)
        enroll_url = reverse('learner-enroll-class', kwargs={'class_id': class_id})
        enroll_response = self.client.post(enroll_url)
        self.assertEqual(enroll_response.status_code, status.HTTP_200_OK)
        self.assertTrue(Enrollment.objects.filter(class_room_id=class_id, learner=self.learner_user).exists())

    def test_quiz_auto_grading(self):
        # Teacher creates class & assessment
        classroom = ClassRoom.objects.create(
            title='Math Class',
            description='Algebra',
            teacher=self.teacher_user,
            visibility='PUBLIC',
            status='ACTIVE'
        )
        assessment = Assessment.objects.create(
            class_room=classroom,
            created_by=self.teacher_user,
            title='Algebra Quiz',
            assessment_type=Assessment.AssessmentType.QUIZ,
            max_score=10.00
        )
        q = Question.objects.create(
            assessment=assessment,
            text='What is 2 + 2?',
            question_type=Question.QuestionType.MCQ,
            points=10.00
        )
        opt_correct = QuestionOption.objects.create(question=q, text='4', is_correct=True)
        opt_wrong = QuestionOption.objects.create(question=q, text='5', is_correct=False)

        # Learner takes quiz with correct answer
        self.client.force_authenticate(user=self.learner_user)
        submit_url = reverse('assessment-submit', kwargs={'pk': assessment.id})
        submit_payload = {
            'answers': [
                {
                    'question_id': str(q.id),
                    'selected_option_id': str(opt_correct.id)
                }
            ]
        }
        submit_res = self.client.post(submit_url, submit_payload, format='json')
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        self.assertEqual(float(submit_res.data['total_score']), 10.0)
        self.assertEqual(submit_res.data['status'], 'GRADED')

    def test_admin_reports_and_platform_health(self):
        self.client.force_authenticate(user=self.admin_user)

        health_url = reverse('admin-platform-health')
        health_res = self.client.get(health_url)
        self.assertEqual(health_res.status_code, status.HTTP_200_OK)
        self.assertEqual(health_res.data['overall_status'], 'OPERATIONAL')

        reports_url = reverse('admin-reports-analytics')
        reports_res = self.client.get(reports_url)
        self.assertEqual(reports_res.status_code, status.HTTP_200_OK)
        self.assertIn('users', reports_res.data)
        self.assertIn('classes', reports_res.data)

    def test_jwt_logout_and_token_blacklist(self):
        login_url = reverse('token-obtain-pair')
        login_res = self.client.post(login_url, {'email': 'learner@test.com', 'password': 'Password123!'})
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data['access']
        refresh_token = login_res.data['refresh']

        # Logout with refresh token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_url = reverse('auth-logout')
        logout_res = self.client.post(logout_url, {'refresh': refresh_token})
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)
        self.assertIn('Token revoked', logout_res.data['detail'])

        # Attempt to refresh token using the blacklisted refresh token - should fail!
        refresh_url = reverse('token-refresh')
        failed_refresh = self.client.post(refresh_url, {'refresh': refresh_token})
        self.assertEqual(failed_refresh.status_code, status.HTTP_401_UNAUTHORIZED)

