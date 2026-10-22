export interface MockClassItem {
  id: string;
  numeric_id: number;
  name: string;
  title: string;
  description: string;
  subtitle: string;
  subject: string;
  category: string;
  grade: string;
  group: string;
  teacher: number;
  teacher_name: string;
  instructor: string;
  lessons: number;
  level: string;
  enrolled_count: number;
  max_students: number;
  schedule: string;
  join_code: string;
  status: string;
  banner_image: string | null;
  image: string;
  is_enrolled_default?: boolean;
  is_teacher_default?: boolean;
  is_completed?: boolean;
  progress?: number;
  created_at: string;
}

export interface MockEnrollmentItem {
  id: string;
  student: number;
  school_class: number;
  class_room: string;
  class_title: string;
  class_subject: string;
  teacher_name: string;
  status: "ENROLLED" | "COMPLETED" | "DROPPED" | "PENDING";
  enrolled_at: string;
}

// Initial full table of classes — matching Teacher Classes & Learner Catalog
export const initialClassesTable: MockClassItem[] = [
  // 1. Teacher Active: Algebra I
  {
    id: "algebra",
    numeric_id: 1,
    name: "Algebra I",
    title: "Algebra I",
    description: "Linear equations & inequalities · Solving two-step equations and graphing inequalities.",
    subtitle: "Linear equations & inequalities · Solving two-step equations and graphing inequalities.",
    subject: "Mathematics",
    category: "Mathematics",
    grade: "Grade 9",
    group: "Class A",
    teacher: 1,
    teacher_name: "Mwizerwa Stiven",
    instructor: "Mwizerwa Stiven",
    lessons: 12,
    level: "Intermediate",
    enrolled_count: 28,
    max_students: 30,
    schedule: "Mon, Wed, Fri · 09:00–09:50",
    join_code: "ALG-IX-28",
    status: "ENROLLED",
    banner_image: null,
    image: "/courses/mathematics.jpg",
    is_enrolled_default: true,
    is_teacher_default: true,
    is_completed: false,
    progress: 72,
    created_at: "2026-09-01T08:00:00Z",
  },
  // 2. Teacher Active: Geometry
  {
    id: "geometry",
    numeric_id: 2,
    name: "Geometry",
    title: "Geometry",
    description: "Congruence & similarity · SSS, SAS, and ASA congruence theorem applications.",
    subtitle: "Congruence & similarity · SSS, SAS, and ASA congruence theorem applications.",
    subject: "Mathematics",
    category: "Mathematics",
    grade: "Grade 10",
    group: "Class B",
    teacher: 1,
    teacher_name: "Mwizerwa Stiven",
    instructor: "Mwizerwa Stiven",
    lessons: 10,
    level: "Intermediate",
    enrolled_count: 30,
    max_students: 35,
    schedule: "Tue, Thu · 11:00–11:50",
    join_code: "GEO-IX-26",
    status: "ENROLLED",
    banner_image: null,
    image: "/courses/mathematics.jpg",
    is_enrolled_default: true,
    is_teacher_default: true,
    is_completed: false,
    progress: 65,
    created_at: "2026-09-02T08:00:00Z",
  },
  // 3. Teacher Active: Precalculus
  {
    id: "precalculus",
    numeric_id: 3,
    name: "Precalculus",
    title: "Precalculus",
    description: "Polynomial & rational functions · Finding polynomial zeros and function analysis.",
    subtitle: "Polynomial & rational functions · Finding polynomial zeros and function analysis.",
    subject: "Mathematics",
    category: "Mathematics",
    grade: "Grade 11",
    group: "Class C",
    teacher: 1,
    teacher_name: "Mwizerwa Stiven",
    instructor: "Mwizerwa Stiven",
    lessons: 14,
    level: "Advanced",
    enrolled_count: 25,
    max_students: 30,
    schedule: "Mon, Wed · 14:00–14:50",
    join_code: "PRE-IX-26",
    status: "ENROLLED",
    banner_image: null,
    image: "/courses/mathematics.jpg",
    is_enrolled_default: true,
    is_teacher_default: true,
    is_completed: false,
    progress: 40,
    created_at: "2026-09-03T08:00:00Z",
  },
  // 4. Teacher Class: Biology
  {
    id: "biology",
    numeric_id: 4,
    name: "Biology",
    title: "Biology",
    description: "Cells & ecosystems · Cellular respiration, genetics, and environment biology.",
    subtitle: "Cells & ecosystems · Cellular respiration, genetics, and environment biology.",
    subject: "Science",
    category: "Science",
    grade: "Grade 8",
    group: "Class D",
    teacher: 1,
    teacher_name: "Mwizerwa Stiven",
    instructor: "Mwizerwa Stiven",
    lessons: 15,
    level: "Beginner",
    enrolled_count: 24,
    max_students: 30,
    schedule: "Mon, Wed · 10:00–10:50",
    join_code: "BIO-VIII-25",
    status: "ENROLLED",
    banner_image: null,
    image: "/courses/soft-skills.jpg",
    is_enrolled_default: true,
    is_teacher_default: true,
    is_completed: false,
    progress: 55,
    created_at: "2026-09-04T08:00:00Z",
  },
  // 5. Teacher Class: Statistics
  {
    id: "statistics",
    numeric_id: 5,
    name: "Statistics",
    title: "Statistics",
    description: "Probability & data analysis · Distributions, variance, and hypothesis testing.",
    subtitle: "Probability & data analysis · Distributions, variance, and hypothesis testing.",
    subject: "Mathematics",
    category: "Mathematics",
    grade: "Grade 12",
    group: "Class E",
    teacher: 1,
    teacher_name: "Mwizerwa Stiven",
    instructor: "Mwizerwa Stiven",
    lessons: 12,
    level: "Advanced",
    enrolled_count: 26,
    max_students: 30,
    schedule: "Tue, Thu · 13:00–13:50",
    join_code: "STA-XII-25",
    status: "ENROLLED",
    banner_image: null,
    image: "/courses/mathematics.jpg",
    is_enrolled_default: true,
    is_teacher_default: true,
    is_completed: false,
    progress: 30,
    created_at: "2026-09-05T08:00:00Z",
  },
  // 6. React.js
  {
    id: "react",
    numeric_id: 6,
    name: "React.js — Modern Frontend Development",
    title: "React.js — Modern Frontend Development",
    description: "Build dynamic UIs with hooks, state management & React Router. Industry-standard frontend skills.",
    subtitle: "Build dynamic UIs with hooks, state management & React Router. Industry-standard frontend skills.",
    subject: "Development",
    category: "Development",
    grade: "Grade 10",
    group: "Class A",
    teacher: 101,
    teacher_name: "Sarah Mitchell",
    instructor: "Sarah Mitchell",
    lessons: 14,
    level: "Intermediate",
    enrolled_count: 28,
    max_students: 35,
    schedule: "Mon, Wed, Fri · 09:00–09:50",
    join_code: "RCT-2026-X",
    status: "ENROLLED",
    banner_image: "/courses/react.jpg",
    image: "/courses/react.jpg",
    is_enrolled_default: true,
    progress: 67,
    created_at: "2026-09-06T08:00:00Z",
  },
  // 7. UI/UX Design
  {
    id: "uiux",
    numeric_id: 7,
    name: "UI/UX Design — Wireframes to Prototypes",
    title: "UI/UX Design — Wireframes to Prototypes",
    description: "Master Figma, user research, design systems & usability testing from scratch.",
    subtitle: "Master Figma, user research, design systems & usability testing from scratch.",
    subject: "Design",
    category: "Design",
    grade: "Grade 10",
    group: "Class B",
    teacher: 102,
    teacher_name: "Amara Okafor",
    instructor: "Amara Okafor",
    lessons: 12,
    level: "Beginner",
    enrolled_count: 30,
    max_students: 35,
    schedule: "Tue, Thu · 11:00–11:50",
    join_code: "UIX-2026-B",
    status: "ENROLLED",
    banner_image: "/courses/uiux-design.jpg",
    image: "/courses/uiux-design.jpg",
    is_enrolled_default: true,
    progress: 58,
    created_at: "2026-09-07T08:00:00Z",
  },
  // 8. Django
  {
    id: "django",
    numeric_id: 8,
    name: "Django — Full-Stack Web Applications",
    title: "Django — Full-Stack Web Applications",
    description: "Build REST APIs, MVC architecture, authentication & deploy production-ready apps.",
    subtitle: "Build REST APIs, MVC architecture, authentication & deploy production-ready apps.",
    subject: "Development",
    category: "Development",
    grade: "Grade 11",
    group: "Class C",
    teacher: 103,
    teacher_name: "Daniel Brooks",
    instructor: "Daniel Brooks",
    lessons: 16,
    level: "Intermediate",
    enrolled_count: 25,
    max_students: 30,
    schedule: "Mon, Wed · 14:00–14:50",
    join_code: "DJN-2026-C",
    status: "ENROLLED",
    banner_image: "/courses/django.jpg",
    image: "/courses/django.jpg",
    is_enrolled_default: true,
    progress: 34,
    created_at: "2026-09-08T08:00:00Z",
  },
  // 9. Mathematics
  {
    id: "math",
    numeric_id: 9,
    name: "Mathematics for Everyday Life",
    title: "Mathematics for Everyday Life",
    description: "Linear functions, probability, statistics & applied problem solving in real-world contexts.",
    subtitle: "Linear functions, probability, statistics & applied problem solving in real-world contexts.",
    subject: "Mathematics",
    category: "Mathematics",
    grade: "Grade 9",
    group: "Class D",
    teacher: 104,
    teacher_name: "Dr. Elena Ruiz",
    instructor: "Dr. Elena Ruiz",
    lessons: 12,
    level: "Beginner",
    enrolled_count: 22,
    max_students: 30,
    schedule: "Wed, Fri · 10:00–10:50",
    join_code: "MTH-2026-D",
    status: "ENROLLED",
    banner_image: "/courses/mathematics.jpg",
    image: "/courses/mathematics.jpg",
    is_enrolled_default: true,
    progress: 75,
    created_at: "2026-09-09T08:00:00Z",
  },
  // 10. Cybersecurity
  {
    id: "security",
    numeric_id: 10,
    name: "Cybersecurity Fundamentals",
    title: "Cybersecurity Fundamentals",
    description: "Network security, ethical hacking basics, threat analysis & modern defence strategies.",
    subtitle: "Network security, ethical hacking basics, threat analysis & modern defence strategies.",
    subject: "Security",
    category: "Security",
    grade: "Grade 11",
    group: "Class E",
    teacher: 105,
    teacher_name: "Marcus Adeyemi",
    instructor: "Marcus Adeyemi",
    lessons: 10,
    level: "Intermediate",
    enrolled_count: 19,
    max_students: 30,
    schedule: "Tue, Thu · 15:00–15:50",
    join_code: "SEC-2026-E",
    status: "AVAILABLE",
    banner_image: "/courses/cybersecurity.jpg",
    image: "/courses/cybersecurity.jpg",
    created_at: "2026-09-10T08:00:00Z",
  },
  // 11. Graphic Design
  {
    id: "design",
    numeric_id: 11,
    name: "Graphic Design — Visual Storytelling",
    title: "Graphic Design — Visual Storytelling",
    description: "Typography, colour theory, brand identity & Adobe Illustrator for modern graphic designers.",
    subtitle: "Typography, colour theory, brand identity & Adobe Illustrator for modern graphic designers.",
    subject: "Design",
    category: "Design",
    grade: "Grade 10",
    group: "Class F",
    teacher: 106,
    teacher_name: "Nadia Fernandez",
    instructor: "Nadia Fernandez",
    lessons: 10,
    level: "Beginner",
    enrolled_count: 24,
    max_students: 30,
    schedule: "Mon, Thu · 16:00–16:50",
    join_code: "GD-2026-F",
    status: "AVAILABLE",
    banner_image: "/courses/graphic-design.jpg",
    image: "/courses/graphic-design.jpg",
    created_at: "2026-09-11T08:00:00Z",
  },
  // 12. Soft Skills
  {
    id: "softskills",
    numeric_id: 12,
    name: "Soft Skills for the Digital Age",
    title: "Soft Skills for the Digital Age",
    description: "Communication, leadership, critical thinking & emotional intelligence for modern professionals.",
    subtitle: "Communication, leadership, critical thinking & emotional intelligence for modern professionals.",
    subject: "Personal Growth",
    category: "Personal Growth",
    grade: "All Levels",
    group: "Class G",
    teacher: 107,
    teacher_name: "Prof. James Osei",
    instructor: "Prof. James Osei",
    lessons: 8,
    level: "All Levels",
    enrolled_count: 31,
    max_students: 40,
    schedule: "Wed · 13:00–14:30",
    join_code: "SS-2026-G",
    status: "AVAILABLE",
    banner_image: "/courses/soft-skills.jpg",
    image: "/courses/soft-skills.jpg",
    created_at: "2026-09-12T08:00:00Z",
  },
  // 13. Machine Learning
  {
    id: "ml",
    numeric_id: 13,
    name: "Machine Learning — Foundations & Practice",
    title: "Machine Learning — Foundations & Practice",
    description: "Supervised & unsupervised learning, model evaluation, Python scikit-learn & real datasets.",
    subtitle: "Supervised & unsupervised learning, model evaluation, Python scikit-learn & real datasets.",
    subject: "Data & AI",
    category: "Data & AI",
    grade: "Grade 12",
    group: "Class H",
    teacher: 108,
    teacher_name: "Dr. Priya Nair",
    instructor: "Dr. Priya Nair",
    lessons: 14,
    level: "Advanced",
    enrolled_count: 27,
    max_students: 35,
    schedule: "Tue, Fri · 14:00–15:30",
    join_code: "ML-2026-H",
    status: "AVAILABLE",
    banner_image: "/courses/machine-learning.jpg",
    image: "/courses/machine-learning.jpg",
    created_at: "2026-09-13T08:00:00Z",
  },
];

// Initial enrollments for the student — fully aligned with Teacher Classes
export const initialEnrollmentsTable: MockEnrollmentItem[] = [
  {
    id: "enr-algebra",
    student: 1,
    school_class: 1,
    class_room: "algebra",
    class_title: "Algebra I",
    class_subject: "Mathematics",
    teacher_name: "Mwizerwa Stiven",
    status: "ENROLLED",
    enrolled_at: "2026-09-01",
  },
  {
    id: "enr-geometry",
    student: 1,
    school_class: 2,
    class_room: "geometry",
    class_title: "Geometry",
    class_subject: "Mathematics",
    teacher_name: "Mwizerwa Stiven",
    status: "ENROLLED",
    enrolled_at: "2026-09-02",
  },
  {
    id: "enr-precalculus",
    student: 1,
    school_class: 3,
    class_room: "precalculus",
    class_title: "Precalculus",
    class_subject: "Mathematics",
    teacher_name: "Mwizerwa Stiven",
    status: "ENROLLED",
    enrolled_at: "2026-09-03",
  },
  {
    id: "enr-biology",
    student: 1,
    school_class: 4,
    class_room: "biology",
    class_title: "Biology",
    class_subject: "Science",
    teacher_name: "Mwizerwa Stiven",
    status: "ENROLLED",
    enrolled_at: "2026-09-04",
  },
  {
    id: "enr-statistics",
    student: 1,
    school_class: 5,
    class_room: "statistics",
    class_title: "Statistics",
    class_subject: "Mathematics",
    teacher_name: "Mwizerwa Stiven",
    status: "ENROLLED",
    enrolled_at: "2026-09-05",
  },
  {
    id: "enr-react",
    student: 1,
    school_class: 6,
    class_room: "react",
    class_title: "React.js — Modern Frontend Development",
    class_subject: "Development",
    teacher_name: "Sarah Mitchell",
    status: "ENROLLED",
    enrolled_at: "2026-09-06",
  },
  {
    id: "enr-uiux",
    student: 1,
    school_class: 7,
    class_room: "uiux",
    class_title: "UI/UX Design — Wireframes to Prototypes",
    class_subject: "Design",
    teacher_name: "Amara Okafor",
    status: "ENROLLED",
    enrolled_at: "2026-09-07",
  },
  {
    id: "enr-django",
    student: 1,
    school_class: 8,
    class_room: "django",
    class_title: "Django — Full-Stack Web Applications",
    class_subject: "Development",
    teacher_name: "Daniel Brooks",
    status: "ENROLLED",
    enrolled_at: "2026-09-08",
  },
  {
    id: "enr-math",
    student: 1,
    school_class: 9,
    class_room: "math",
    class_title: "Mathematics for Everyday Life",
    class_subject: "Mathematics",
    teacher_name: "Dr. Elena Ruiz",
    status: "ENROLLED",
    enrolled_at: "2026-09-09",
  },
];

// In-memory persistent stores during server lifecycle
let classesStore: MockClassItem[] = [...initialClassesTable];
let enrollmentsStore: MockEnrollmentItem[] = [...initialEnrollmentsTable];

export function getClassesTable(): MockClassItem[] {
  return classesStore;
}

export function getEnrollmentsTable(): MockEnrollmentItem[] {
  return enrollmentsStore;
}

export function enrollStudentInClass(classId: string, studentId = 1): MockEnrollmentItem {
  const targetClass = classesStore.find(
    (c) => String(c.id).toLowerCase() === String(classId).toLowerCase() ||
           String(c.numeric_id) === String(classId)
  );

  const existing = enrollmentsStore.find(
    (e) => (String(e.class_room).toLowerCase() === String(classId).toLowerCase() ||
            String(e.school_class) === String(classId)) &&
           e.student === studentId
  );

  if (existing) {
    existing.status = "ENROLLED";
    return existing;
  }

  const newEnrollment: MockEnrollmentItem = {
    id: `enr-${classId}-${Date.now()}`,
    student: studentId,
    school_class: targetClass ? targetClass.numeric_id : (enrollmentsStore.length + 1),
    class_room: targetClass ? targetClass.id : classId,
    class_title: targetClass ? targetClass.title : `Class ${classId}`,
    class_subject: targetClass ? targetClass.subject : "General",
    teacher_name: targetClass ? targetClass.teacher_name : "Instructor",
    status: "ENROLLED",
    enrolled_at: new Date().toISOString().slice(0, 10),
  };

  enrollmentsStore.push(newEnrollment);

  if (targetClass) {
    targetClass.enrolled_count += 1;
    targetClass.status = "ENROLLED";
  }

  return newEnrollment;
}

export function addClassToTable(payload: Partial<MockClassItem>): MockClassItem {
  const numericId = classesStore.length + 1;
  const newClass: MockClassItem = {
    id: payload.id || `class-${numericId}`,
    numeric_id: numericId,
    name: payload.name || payload.title || `Class ${numericId}`,
    title: payload.title || payload.name || `Class ${numericId}`,
    description: payload.description || "Course description to be announced.",
    subtitle: payload.subtitle || payload.description || "Course description to be announced.",
    subject: payload.subject || "General",
    category: payload.category || payload.subject || "General",
    grade: payload.grade || "Grade 10",
    group: payload.group || "Class A",
    teacher: payload.teacher || 1,
    teacher_name: payload.teacher_name || payload.instructor || "Instructor",
    instructor: payload.instructor || payload.teacher_name || "Instructor",
    lessons: payload.lessons || 10,
    level: payload.level || "Beginner",
    enrolled_count: payload.enrolled_count || 0,
    max_students: payload.max_students || 30,
    schedule: payload.schedule || "To be announced",
    join_code: payload.join_code || `JOIN-${numericId}`,
    status: payload.status || "ACTIVE",
    banner_image: payload.banner_image || null,
    image: payload.image || "/courses/react.jpg",
    created_at: new Date().toISOString(),
  };

  classesStore.unshift(newClass);
  return newClass;
}

// Mock assessments submissions for learner dashboard
export const mockAssessmentSubmissions = [
  {
    id: "sub-1",
    assessment_title: "Linear functions practice",
    status: "SUBMITTED",
    total_score: null,
    submitted_at: "2026-10-14T18:00:00Z",
    teacher_feedback: "Submitted and waiting for grading.",
  },
  {
    id: "sub-2",
    assessment_title: "React Hooks & State Architecture",
    status: "GRADED",
    total_score: 92,
    submitted_at: "2026-10-10T14:30:00Z",
    teacher_feedback: "Excellent understanding of custom hooks and memoization.",
  },
  {
    id: "sub-3",
    assessment_title: "Design Systems & Token Foundations",
    status: "GRADED",
    total_score: 88,
    submitted_at: "2026-10-06T11:15:00Z",
    teacher_feedback: "Great typography and color scale hierarchy.",
  },
  {
    id: "sub-4",
    assessment_title: "Django REST Framework Serializers",
    status: "IN_PROGRESS",
    total_score: null,
    submitted_at: null,
    teacher_feedback: null,
  },
];

// Mock learner profile
export const mockLearnerProfile = {
  learning_goals: "Master modern full-stack development with React & Django, maintain 95%+ attendance, and complete all coursework with distinction.",
  grade: "Grade 10",
  attendance_rate: 96,
  average_grade: 89,
};

// Mock sessions interface and store
export interface MockSessionItem {
  id: string;
  class_room: string;
  course_title?: string;
  title: string;
  agenda?: string;
  teacher_name?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  meeting_url?: string;
  room_id?: string;
  host?: number;
}

export interface MockChatMessage {
  id: string;
  session_id: string;
  message: string;
  text?: string;
  sender_id: string | number;
  sender_name: string;
  created_at: string;
  timestamp?: string;
}

export interface MockParticipant {
  id: string;
  name: string;
  role: "teacher" | "learner";
  status: "waiting" | "admitted" | "active" | "left";
  joined_at: string;
  left_at?: string;
  duration_minutes?: number;
  last_alive_at?: string;
  attendance_status?: "Present" | "Late" | "Absent";
  attendance_pct?: number;
  camera_on?: boolean;
  mic_on?: boolean;
}

export const initialSessionsTable: MockSessionItem[] = [
  {
    id: "uiux",
    class_room: "uiux",
    course_title: "UI/UX Design — From Wireframes to Prototypes",
    title: "Design systems & component libraries",
    agenda: "Typography scales, color tokens, and Figma auto-layout components.",
    teacher_name: "Amara Okafor",
    scheduled_start: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    status: "LIVE",
    meeting_url: "/learner/live_classes/waiting-room?session=uiux",
    room_id: "room-uiux-live",
    host: 102,
  },
  {
    id: "react",
    class_room: "react",
    course_title: "React.js — Modern Frontend Development",
    title: "React Component Patterns & Hooks",
    agenda: "Advanced useEffect patterns, custom hooks, and memoization.",
    teacher_name: "Sarah Mitchell",
    scheduled_start: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
    status: "LIVE",
    meeting_url: "/learner/live_classes/waiting-room?session=react",
    room_id: "room-react-live",
    host: 101,
  },
  {
    id: "math",
    class_room: "math",
    course_title: "Mathematics for Everyday Life",
    title: "Linear Functions & Problem Solving",
    agenda: "Graphing systems of linear equations and real world applications.",
    teacher_name: "Dr. Elena Ruiz",
    scheduled_start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    status: "SCHEDULED",
    meeting_url: "/learner/live_classes/waiting-room?session=math",
    room_id: "room-math-live",
    host: 104,
  },
  {
    id: "algebra",
    class_room: "algebra",
    course_title: "Algebra I",
    title: "Linear Equations & Inequalities",
    agenda: "Solving two-step equations and graphing inequalities.",
    teacher_name: "Mwizerwa Stiven",
    scheduled_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    status: "LIVE",
    meeting_url: "/learner/live_classes/waiting-room?session=algebra",
    room_id: "room-algebra-live",
    host: 1,
  },
  {
    id: "geometry",
    class_room: "geometry",
    course_title: "Geometry",
    title: "Triangle Congruence Proofs",
    agenda: "SSS, SAS, and ASA congruence theorem applications.",
    teacher_name: "Mwizerwa Stiven",
    scheduled_start: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    status: "SCHEDULED",
    meeting_url: "/learner/live_classes/waiting-room?session=geometry",
    room_id: "room-geometry-live",
    host: 1,
  },
];

let sessionsStore: MockSessionItem[] = [...initialSessionsTable];
const sessionChatsStore = new Map<string, MockChatMessage[]>([
  [
    "uiux",
    [
      {
        id: "msg-1",
        session_id: "uiux",
        message: "Welcome to today's live class on Design Systems! Feel free to ask questions here.",
        text: "Welcome to today's live class on Design Systems! Feel free to ask questions here.",
        sender_id: "teacher-102",
        sender_name: "Amara Okafor",
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
    ],
  ],
  [
    "react",
    [
      {
        id: "msg-2",
        session_id: "react",
        message: "Hello everyone! We'll start covering custom hooks in 2 minutes.",
        text: "Hello everyone! We'll start covering custom hooks in 2 minutes.",
        sender_id: "teacher-101",
        sender_name: "Sarah Mitchell",
        created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
    ],
  ],
  [
    "algebra",
    [
      {
        id: "msg-3",
        session_id: "algebra",
        message: "Welcome learners! Please open your Algebra worksheet.",
        text: "Welcome learners! Please open your Algebra worksheet.",
        sender_id: "1",
        sender_name: "Mwizerwa Stiven",
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
    ],
  ],
]);

const sessionParticipantsStore = new Map<string, MockParticipant[]>();

// Store of registered teacher emails so role is recognized across logins
const teacherEmails = new Set<string>([
  "teacher@konnect.com",
  "instructor@konnect.com",
]);

export function registerTeacherEmail(email: string) {
  if (email) teacherEmails.add(email.trim().toLowerCase());
}

export function isTeacherEmail(email: string): boolean {
  if (!email) return false;
  return teacherEmails.has(email.trim().toLowerCase());
}

export function getSessionsTable(): MockSessionItem[] {
  return sessionsStore;
}

export function getSessionById(sessionId: string): MockSessionItem {
  const cleanId = String(sessionId || "").trim();
  const existing = sessionsStore.find(
    (s) => s.id.toLowerCase() === cleanId.toLowerCase() ||
           s.class_room.toLowerCase() === cleanId.toLowerCase()
  );
  if (existing) return existing;

  // If no session with this ID, check if a class with this ID exists
  const matchingClass = classesStore.find(
    (c) => String(c.id).toLowerCase() === cleanId.toLowerCase() ||
           String(c.numeric_id) === cleanId
  );

  const newSession: MockSessionItem = {
    id: cleanId,
    class_room: matchingClass ? matchingClass.id : cleanId,
    course_title: matchingClass ? matchingClass.title : `Class ${cleanId}`,
    title: matchingClass ? `${matchingClass.title} Live Class` : `Live Session · ${cleanId}`,
    agenda: matchingClass ? matchingClass.description : "Interactive live session.",
    teacher_name: matchingClass ? matchingClass.teacher_name : "Class Instructor",
    scheduled_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "LIVE",
    meeting_url: `/learner/live_classes/waiting-room?session=${encodeURIComponent(cleanId)}`,
    room_id: `room-${cleanId}`,
    host: matchingClass ? matchingClass.teacher : 1,
  };

  sessionsStore.push(newSession);
  return newSession;
}

export function createClassSessionRecord(payload: Partial<MockSessionItem>): MockSessionItem {
  const sessionId = payload.id || `sess-${Date.now()}`;
  const classRoom = payload.class_room || "general";
  const matchingClass = classesStore.find((c) => c.id === classRoom);

  const newSession: MockSessionItem = {
    id: sessionId,
    class_room: classRoom,
    course_title: payload.course_title || matchingClass?.title || `Class ${classRoom}`,
    title: payload.title || `${matchingClass?.title || classRoom} Live Class`,
    agenda: payload.agenda || matchingClass?.description || "Live course session",
    teacher_name: payload.teacher_name || matchingClass?.teacher_name || "Instructor",
    scheduled_start: payload.scheduled_start || new Date().toISOString(),
    scheduled_end: payload.scheduled_end || new Date(Date.now() + 3600 * 1000).toISOString(),
    status: payload.status || "LIVE",
    meeting_url: payload.meeting_url || `/learner/live_classes/waiting-room?session=${encodeURIComponent(sessionId)}`,
    room_id: payload.room_id || `room-${sessionId}`,
    host: payload.host || matchingClass?.teacher || 1,
  };

  sessionsStore.unshift(newSession);
  return newSession;
}

export function joinSessionRecord(sessionId: string, studentId = 1, studentName = "Learner"): {
  status: "admitted";
  detail: string;
  session: MockSessionItem;
} {
  const session = getSessionById(sessionId);
  session.status = "LIVE";

  // Ensure student is enrolled in the session's class
  enrollStudentInClass(session.class_room, studentId);

  // Add to participants
  const participants = sessionParticipantsStore.get(session.id) || [];
  const existingParticipant = participants.find((p) => p.id === String(studentId));
  if (!existingParticipant) {
    participants.push({
      id: String(studentId),
      name: studentName,
      role: "learner",
      status: "active",
      joined_at: new Date().toISOString(),
      camera_on: true,
      mic_on: true,
    });
    sessionParticipantsStore.set(session.id, participants);
  }

  return {
    status: "admitted",
    detail: "Joined successfully",
    session,
  };
}

export function startSessionRecord(sessionId: string): MockSessionItem {
  const session = getSessionById(sessionId);
  session.status = "LIVE";
  return session;
}

export function endSessionRecord(sessionId: string): MockSessionItem {
  const session = getSessionById(sessionId);
  session.status = "COMPLETED";
  return session;
}

export function getSessionChatMessages(sessionId: string): MockChatMessage[] {
  const cleanId = String(sessionId || "").trim();
  return sessionChatsStore.get(cleanId) || [];
}

export function addSessionChatMessage(
  sessionId: string,
  message: string,
  senderName = "User",
  senderId: string | number = 1
): MockChatMessage {
  const cleanId = String(sessionId || "").trim();
  const messages = sessionChatsStore.get(cleanId) || [];
  const newMsg: MockChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    session_id: cleanId,
    message,
    text: message,
    sender_id: senderId,
    sender_name: senderName,
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  messages.push(newMsg);
  sessionChatsStore.set(cleanId, messages);
  return newMsg;
}

export function getSessionAttendanceList(sessionId: string): MockParticipant[] {
  const cleanId = String(sessionId || "").trim();
  return sessionParticipantsStore.get(cleanId) || [
    {
      id: "teacher-host",
      name: getSessionById(sessionId).teacher_name || "Instructor",
      role: "teacher",
      status: "active",
      joined_at: new Date().toISOString(),
      camera_on: true,
      mic_on: true,
    },
  ];
}

