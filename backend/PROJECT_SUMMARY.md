# KONNECT - Virtual Classroom

## Project Overview
KONNECT Virtual Classroom is a comprehensive virtual classroom and e-learning platform designed to facilitate online education, enhance student engagement, and provide seamless classroom management. The platform is built to support a robust interaction between Teachers, Learners, and Administrators.

## Core Modules & Features
The system is divided into several modular applications to handle different aspects of the e-learning experience:

1. **Accounts & Roles (`accounts`)**: 
   - Manages unified `User` authentication.
   - Distinct profiles and permissions for `TeacherProfile`, `LearnerProfile`, and `AdminProfile`.
2. **Class Management (`classes`)**: 
   - Teachers can create and manage `ClassRoom`s and set `ClassSchedule`s.
   - Learners join via `Enrollment` and can leave a `ClassRating`.
3. **Assessments (`assessments`)**: 
   - Supports creating Quizzes, Exams, and Homework (`Assessment`, `Question`, `QuestionOption`).
   - Tracks learner progress through `AssessmentSubmission` and `StudentAnswer`.
4. **Live Sessions (`live_sessions`)**: 
   - Manages virtual meetings (`LiveSession`), tracks `SessionAttendance`, and handles real-time `SessionChatMessage`.
5. **Collaboration (`collaboration`)**: 
   - Encourages peer-to-peer learning through `StudyGroup`s and `StudyGroupMessage`s.
   - Allows learners to create personal `StudyPlan`s.
6. **Communication (`communication`)**: 
   - Global and class-specific `Announcement`s.
   - Real-time `Notification`s and a `SupportTicket` system for issue resolution.
7. **Student Tracking & Gamification (`students`)**: 
   - Awards `Badge`s to learners to boost engagement.
   - Teachers can raise `LearnerFlag`s (e.g., Attendance Issue, Academic Struggle) to track and intervene when a student needs help.

---

## High-Level Architecture (Simplified ERD)
Below is a simplified Entity-Relationship Diagram highlighting the core data structures and how they interact. 
*(Note: Minor details, profiles, and granular tables like individual chat messages or single assessment questions have been abstracted for clarity).*

```mermaid
erDiagram
    %% Core Entities
    USER {
        UUID id PK
        string email
        string role "Admin, Teacher, Learner"
    }
    
    CLASS_ROOM {
        UUID id PK
        string title
        UUID teacher_id FK
        string status
    }
    
    ENROLLMENT {
        UUID id PK
        UUID learner_id FK
        UUID class_room_id FK
        string status
    }
    
    ASSESSMENT {
        UUID id PK
        string title
        string assessment_type "Quiz, Exam, Homework"
        UUID class_room_id FK
    }
    
    ASSESSMENT_SUBMISSION {
        UUID id PK
        UUID assessment_id FK
        UUID learner_id FK
        decimal total_score
        string status
    }
    
    LIVE_SESSION {
        UUID id PK
        string title
        datetime scheduled_start
        string meeting_url
        UUID class_room_id FK
    }
    
    STUDY_GROUP {
        UUID id PK
        string name
        UUID class_room_id FK
    }

    %% Core Relationships
    USER ||--o{ CLASS_ROOM : "teaches"
    USER ||--o{ ENROLLMENT : "enrolls in"
    CLASS_ROOM ||--o{ ENROLLMENT : "has students"
    
    CLASS_ROOM ||--o{ ASSESSMENT : "contains"
    USER ||--o{ ASSESSMENT_SUBMISSION : "submits"
    ASSESSMENT ||--o{ ASSESSMENT_SUBMISSION : "receives"
    
    CLASS_ROOM ||--o{ LIVE_SESSION : "hosts"
    
    CLASS_ROOM ||--o{ STUDY_GROUP : "has"
```
