import database from "@/data/database.json";

type DatabaseCourse = (typeof database.classes)[number];

export type MockCourse = {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher_name: string;
  banner_image: string | null;
  isDemo: true;
};

export const mockCourses: MockCourse[] = (database.classes as DatabaseCourse[]).map((course) => ({
  id: `demo-${course.id}`,
  title: course.title,
  description: course.description || course.subtitle || "Sample course content for the learner dashboard.",
  subject: course.subject || course.category || "General",
  teacher_name: course.teacher_name || course.instructor || "Konnect instructor",
  banner_image: course.banner_image || course.image || null,
  isDemo: true,
}));
