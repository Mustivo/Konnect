from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date, time
from decimal import Decimal
from django.contrib.auth import get_user_model

from apps.accounts.models import TeacherProfile, LearnerProfile, AdminProfile, AuditLog
from apps.classes.models import ClassRoom, ClassSchedule, Enrollment, ClassRating
from apps.live_sessions.models import LiveSession, SessionAttendance, SessionChatMessage
from apps.assessments.models import Assessment, Question, QuestionOption, AssessmentSubmission, StudentAnswer
from apps.students.models import Badge, LearnerBadge, LearnerFlag
from apps.collaboration.models import StudyGroup, StudyGroupMessage, StudyPlan, StudyPlanItem
from apps.communication.models import Announcement, Notification, SupportTicket, SupportTicketMessage
from apps.analytics.models import PlatformHealthMetric
from apps.future_features.models import PaymentRecord, AIAssistantSession

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds initial demo data matching all user flows for KONNECT Virtual Classroom"

    def handle(self, *args, **options):
        self.stdout.write("Clearing previous seed data if any...")

        # 1. Create Users
        # Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@konnect.com',
            defaults={
                'username': 'admin',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        admin_user.set_password('AdminPass123!')
        admin_user.save()
        AdminProfile.objects.get_or_create(user=admin_user, defaults={'department': 'Headquarters Operations'})

        # Verified Teacher
        teacher_jane, _ = User.objects.get_or_create(
            email='teacher.jane@konnect.com',
            defaults={
                'username': 'teacher_jane',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'role': User.Role.TEACHER,
                'is_verified': True,
                'phone_number': '+250788112233'
            }
        )
        teacher_jane.set_password('TeacherPass123!')
        teacher_jane.save()
        t_prof, _ = TeacherProfile.objects.get_or_create(
            user=teacher_jane,
            defaults={
                'bio': 'Senior Computer Science and Mathematics Lecturer with 8 years of virtual pedagogy experience.',
                'qualifications': 'MSc in Computer Science, Certified Online Educator',
                'expertise_subjects': 'Python, Algorithms, Data Science',
                'verification_status': TeacherProfile.VerificationStatus.APPROVED,
                'verified_at': timezone.now(),
                'verified_by': admin_user
            }
        )

        # Pending Teacher (for admin verification flow testing)
        teacher_mark, _ = User.objects.get_or_create(
            email='teacher.mark@konnect.com',
            defaults={
                'username': 'teacher_mark',
                'first_name': 'Mark',
                'last_name': 'Smith',
                'role': User.Role.TEACHER,
                'is_verified': False,
                'phone_number': '+250788998877'
            }
        )
        teacher_mark.set_password('TeacherPass123!')
        teacher_mark.save()
        TeacherProfile.objects.get_or_create(
            user=teacher_mark,
            defaults={
                'bio': 'Physics teacher passionate about STEM and interactive classroom experiments.',
                'qualifications': 'BSc in Applied Physics',
                'expertise_subjects': 'Physics, Mechanics',
                'verification_status': TeacherProfile.VerificationStatus.PENDING,
            }
        )

        # Learners
        learner_alice, _ = User.objects.get_or_create(
            email='learner.alice@konnect.com',
            defaults={
                'username': 'alice',
                'first_name': 'Alice',
                'last_name': 'Umutoni',
                'role': User.Role.LEARNER,
                'is_verified': True,
            }
        )
        learner_alice.set_password('LearnerPass123!')
        learner_alice.save()
        LearnerProfile.objects.get_or_create(
            user=learner_alice,
            defaults={
                'date_of_birth': date(2005, 4, 15),
                'grade_level': 'Grade 12 / High School Senior',
                'learning_goals': 'Master Python and algorithms for university computer science entrance.',
                'interests': 'Programming, AI, Robotics'
            }
        )

        learner_bob, _ = User.objects.get_or_create(
            email='learner.bob@konnect.com',
            defaults={
                'username': 'bob',
                'first_name': 'Bob',
                'last_name': 'Kagame',
                'role': User.Role.LEARNER,
                'is_verified': True,
            }
        )
        learner_bob.set_password('LearnerPass123!')
        learner_bob.save()
        LearnerProfile.objects.get_or_create(
            user=learner_bob,
            defaults={
                'date_of_birth': date(2006, 8, 22),
                'grade_level': 'Grade 11',
                'learning_goals': 'Improve mathematics and data analysis fundamentals.',
                'interests': 'Mathematics, Gaming, Web Tech'
            }
        )

        # 2. Classes (Public and Private, limits, schedules)
        class_public, _ = ClassRoom.objects.get_or_create(
            title='Introduction to Python & Web Systems',
            defaults={
                'description': 'Master Python from basics to backend development, APIs, and modern data structures.',
                'subject': 'Computer Science',
                'teacher': teacher_jane,
                'visibility': ClassRoom.Visibility.PUBLIC,
                'status': ClassRoom.Status.ACTIVE,
                'max_students': 30,
                'enrollment_code': 'PY101',
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=90),
            }
        )
        ClassSchedule.objects.get_or_create(
            class_room=class_public,
            day_of_week=ClassSchedule.DayOfWeek.MONDAY,
            defaults={'start_time': time(9, 0), 'end_time': time(10, 30), 'room_notes': 'Main Lecture Hall A'}
        )
        ClassSchedule.objects.get_or_create(
            class_room=class_public,
            day_of_week=ClassSchedule.DayOfWeek.WEDNESDAY,
            defaults={'start_time': time(9, 0), 'end_time': time(10, 30), 'room_notes': 'Lab & Code Clinic'}
        )

        class_private, _ = ClassRoom.objects.get_or_create(
            title='Advanced Algorithms & Olympiad Prep',
            defaults={
                'description': 'Exclusive competitive programming and algorithmic problem solving cohort.',
                'subject': 'Mathematics & Algorithms',
                'teacher': teacher_jane,
                'visibility': ClassRoom.Visibility.PRIVATE,
                'status': ClassRoom.Status.ACTIVE,
                'max_students': 15,
                'enrollment_code': 'ALGO2026',
                'start_date': date.today(),
                'end_date': date.today() + timedelta(days=60),
            }
        )

        # 3. Enrollments
        Enrollment.objects.get_or_create(
            class_room=class_public,
            learner=learner_alice,
            defaults={'status': Enrollment.Status.ENROLLED}
        )
        Enrollment.objects.get_or_create(
            class_room=class_public,
            learner=learner_bob,
            defaults={'status': Enrollment.Status.ENROLLED}
        )
        Enrollment.objects.get_or_create(
            class_room=class_private,
            learner=learner_alice,
            defaults={'status': Enrollment.Status.ENROLLED}
        )

        # Post-class ratings
        ClassRating.objects.get_or_create(
            class_room=class_public,
            learner=learner_alice,
            defaults={'rating': 5, 'review': 'Exceptional course! Clear explanations and interactive live sessions.'}
        )

        # 4. Live Sessions, Attendance & Chat
        session_today, _ = LiveSession.objects.get_or_create(
            class_room=class_public,
            title='Session 1: Python Fundamentals & Data Structures',
            defaults={
                'agenda': 'Variables, Lists, Dicts, and Writing clean modular functions.',
                'scheduled_start': timezone.now() - timedelta(hours=1),
                'scheduled_end': timezone.now() + timedelta(hours=1),
                'actual_start': timezone.now() - timedelta(minutes=50),
                'status': LiveSession.Status.LIVE,
                'room_id': 'konnect-py101-session-1',
                'meeting_url': 'https://meet.konnect.africa/py101-session-1',
            }
        )
        SessionAttendance.objects.get_or_create(
            session=session_today,
            learner=learner_alice,
            defaults={
                'status': SessionAttendance.AttendanceStatus.PRESENT,
                'duration_seconds': 3000
            }
        )
        SessionAttendance.objects.get_or_create(
            session=session_today,
            learner=learner_bob,
            defaults={
                'status': SessionAttendance.AttendanceStatus.LATE,
                'duration_seconds': 1800
            }
        )
        SessionChatMessage.objects.get_or_create(
            session=session_today,
            sender=teacher_jane,
            defaults={'message': 'Welcome everyone! Today we build our first functions.', 'is_pinned': True}
        )
        SessionChatMessage.objects.get_or_create(
            session=session_today,
            sender=learner_alice,
            defaults={'message': 'Hello Teacher Jane! Excited for this class!'}
        )

        # 5. Assessments, Questions, and Submissions
        quiz_1, _ = Assessment.objects.get_or_create(
            class_room=class_public,
            title='In-Class Live Quiz: Python Core Types',
            defaults={
                'description': 'Quick check on data types and list operations.',
                'assessment_type': Assessment.AssessmentType.QUIZ,
                'created_by': teacher_jane,
                'max_score': Decimal('20.00'),
                'passing_score': Decimal('10.00'),
                'duration_minutes': 15,
                'is_in_session_quiz': True,
                'live_session': session_today,
                'is_published': True,
                'due_date': timezone.now() + timedelta(days=2)
            }
        )
        q1, _ = Question.objects.get_or_create(
            assessment=quiz_1,
            order=1,
            defaults={
                'text': 'Which of the following data structures in Python is immutable?',
                'question_type': Question.QuestionType.MCQ,
                'points': Decimal('10.00')
            }
        )
        QuestionOption.objects.get_or_create(question=q1, text='List', defaults={'is_correct': False})
        QuestionOption.objects.get_or_create(question=q1, text='Tuple', defaults={'is_correct': True, 'explanation': 'Tuples cannot be modified after creation.'})
        QuestionOption.objects.get_or_create(question=q1, text='Dictionary', defaults={'is_correct': False})
        QuestionOption.objects.get_or_create(question=q1, text='Set', defaults={'is_correct': False})

        q2, _ = Question.objects.get_or_create(
            assessment=quiz_1,
            order=2,
            defaults={
                'text': 'Python uses 0-based indexing for lists and sequences.',
                'question_type': Question.QuestionType.TRUE_FALSE,
                'points': Decimal('10.00')
            }
        )
        QuestionOption.objects.get_or_create(question=q2, text='True', defaults={'is_correct': True})
        QuestionOption.objects.get_or_create(question=q2, text='False', defaults={'is_correct': False})

        # Learner Alice submission
        sub_alice, _ = AssessmentSubmission.objects.get_or_create(
            assessment=quiz_1,
            learner=learner_alice,
            defaults={
                'total_score': Decimal('20.00'),
                'status': AssessmentSubmission.Status.GRADED,
                'teacher_feedback': 'Flawless work Alice! Excellent grasp of tuples and indexing.',
                'graded_by': teacher_jane,
                'graded_at': timezone.now(),
                'submitted_at': timezone.now()
            }
        )

        # 6. Badges & Awards
        badge_top, _ = Badge.objects.get_or_create(
            title='Top Performer',
            defaults={
                'description': 'Awarded for achieving 100% on class assessments and active classroom participation.',
                'icon': 'trophy',
                'category': 'EXCELLENCE'
            }
        )
        badge_attend, _ = Badge.objects.get_or_create(
            title='Perfect Attendance',
            defaults={
                'description': 'Awarded for punctual attendance in all scheduled virtual sessions.',
                'icon': 'clock-check',
                'category': 'DEDICATION'
            }
        )
        LearnerBadge.objects.get_or_create(
            badge=badge_top,
            learner=learner_alice,
            defaults={
                'awarded_by': teacher_jane,
                'class_room': class_public,
                'note': 'Scored full marks on Live Classroom Quiz 1.'
            }
        )

        # 7. Student Management Flags
        LearnerFlag.objects.get_or_create(
            learner=learner_bob,
            teacher=teacher_jane,
            class_room=class_public,
            defaults={
                'category': LearnerFlag.Category.ATTENDANCE,
                'severity': LearnerFlag.Severity.MEDIUM,
                'reason': 'Arrived 20 minutes late to live session 1.',
                'action_plan': 'Send reminder notification 15 minutes before next lecture.',
                'status': LearnerFlag.Status.OPEN
            }
        )

        # 8. Collaboration: Study Groups & Study Plans
        group, _ = StudyGroup.objects.get_or_create(
            name='Python Code Champions',
            class_room=class_public,
            defaults={
                'description': 'Peer study group for debugging code exercises and sharing notes.',
                'created_by': learner_alice,
                'is_private': False
            }
        )
        group.members.add(learner_alice, learner_bob)
        StudyGroupMessage.objects.get_or_create(
            group=group,
            sender=learner_alice,
            defaults={'message': 'Hey Bob! Let us review the tuple problem before tomorrow.'}
        )

        plan_alice, _ = StudyPlan.objects.get_or_create(
            learner=learner_alice,
            title='Term 1 Python Mastery Plan',
            defaults={
                'description': 'Cover Python fundamentals, OOP, and build a capstone virtual lab.',
                'target_date': date.today() + timedelta(days=45),
                'status': StudyPlan.Status.ACTIVE
            }
        )
        StudyPlanItem.objects.get_or_create(
            study_plan=plan_alice,
            title='Complete List & Tuple exercises',
            defaults={'due_date': date.today() + timedelta(days=3), 'is_completed': True, 'completed_at': timezone.now()}
        )
        StudyPlanItem.objects.get_or_create(
            study_plan=plan_alice,
            title='Prepare for Midterm Exam',
            defaults={'due_date': date.today() + timedelta(days=20), 'is_completed': False}
        )

        # 9. Communication: Announcements, Notifications, Support
        Announcement.objects.get_or_create(
            title='Welcome to KONNECT Virtual Classroom 2026!',
            defaults={
                'content': 'We are thrilled to launch the new term. Explore your dashboard, join your study groups, and check your calendar.',
                'author': admin_user,
                'priority': Announcement.Priority.URGENT
            }
        )
        Announcement.objects.get_or_create(
            title='Upcoming Quiz 1 & Homework Schedule',
            class_room=class_public,
            defaults={
                'content': 'Please review the lecture notes posted before attempting Quiz 1.',
                'author': teacher_jane,
                'priority': Announcement.Priority.NORMAL
            }
        )
        Notification.objects.get_or_create(
            recipient=learner_alice,
            title='Quiz Graded: Score 20/20',
            defaults={
                'message': 'Your submission for In-Class Live Quiz: Python Core Types was graded by Teacher Jane.',
                'notification_type': Notification.NotificationType.GRADE,
                'action_url': '/learner/progress-grades/'
            }
        )
        ticket, _ = SupportTicket.objects.get_or_create(
            user=learner_bob,
            subject='Audio delay during live session streaming',
            defaults={
                'description': 'I noticed a slight 3-second audio delay on Chrome browser during the live meeting.',
                'priority': SupportTicket.Priority.MEDIUM,
                'status': SupportTicket.Status.OPEN
            }
        )

        # 10. Audit Logs & System Health
        AuditLog.objects.get_or_create(
            actor=admin_user,
            action='TEACHER_VERIFICATION_APPROVED',
            target_model='TeacherProfile',
            target_id=str(t_prof.id),
            defaults={'details': {'teacher_email': teacher_jane.email}}
        )
        PlatformHealthMetric.objects.create(
            service_name='Database (SQLite)',
            status=PlatformHealthMetric.ServiceStatus.HEALTHY,
            response_time_ms=1.5,
            details={'status': 'Online, All migrations applied'}
        )

        # 11. Future Features
        PaymentRecord.objects.get_or_create(
            payer=learner_alice,
            class_room=class_public,
            amount=Decimal('49.99'),
            defaults={
                'currency': 'USD',
                'status': PaymentRecord.Status.COMPLETED,
                'payment_method': 'Mobile Money'
            }
        )
        AIAssistantSession.objects.get_or_create(
            user=learner_alice,
            prompt='Explain the difference between mutable and immutable types in Python with a real example.',
            defaults={
                'tool_mode': AIAssistantSession.ToolMode.STUDY_ASSISTANT,
                'ai_response': 'Mutable objects can be changed after creation (e.g. list.append()), while immutable objects like strings and tuples cannot be altered in-place.',
                'context_class': class_public
            }
        )

        self.stdout.write(self.style.SUCCESS("KONNECT Virtual Classroom demo data seeded successfully!"))
