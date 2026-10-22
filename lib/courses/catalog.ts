import { apiJson, apiRequest } from "@/lib/api/client";
import { mockCourses } from "@/lib/mock/courses";

export type CourseCatalogItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher_name: string;
  banner_image: string | null;
  isDemo: boolean;
  level?: string;
  lessons?: number;
  course_limit?: number;
  status?: string;
};

type CourseRecord = Record<string, unknown>;
type CourseCollection = CourseRecord[] | { results?: CourseRecord[]; next?: string | null };

function asText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeCourse(record: CourseRecord): CourseCatalogItem {
  return {
    id: String(record.id ?? ""),
    title: asText(record.title ?? record.name, "Course"),
    description: asText(record.description ?? record.subtitle, "Course details coming soon."),
    subject: asText(record.subject ?? record.category, "General"),
    teacher_name: asText(record.teacher_name ?? record.instructor, "Konnect instructor"),
    banner_image: asText(record.banner_image ?? record.image) || null,
    isDemo: Boolean(record.isDemo),
    level: asText(record.level) || undefined,
    lessons: typeof record.lessons === "number" ? record.lessons : undefined,
    course_limit: typeof record.course_limit === "number" ? record.course_limit : undefined,
    status: asText(record.status) || undefined,
  };
}

export async function getCourseCatalog(): Promise<CourseCatalogItem[]> {
  try {
    const allCourses: CourseRecord[] = [];
    for (let page = 1; page <= 100; page += 1) {
      const response = await apiRequest(`/api/courses/${page === 1 ? "" : `?page=${page}`}`, { auth: false });
      const result = await apiJson<CourseCollection>(response);
      if (Array.isArray(result)) {
        allCourses.push(...result);
        break;
      }
      allCourses.push(...(result.results ?? []));
      if (!result.next) break;
    }

    const liveCourses = allCourses.map(normalizeCourse).filter((course) => course.id);
    if (liveCourses.length) return liveCourses;
  } catch (error) {
    console.warn("Could not load the live course catalogue; using dashboard sample courses.", error);
  }

  return mockCourses.map((course) => ({ ...course, isDemo: true }));
}
