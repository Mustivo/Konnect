import { apiRequest } from "./client";

export type ApiCourse = {
  id: string;
  title: string;
  description?: string;
  teacher?: string;
  teacher_name?: string;
  status?: "draft" | "pending" | "approved" | "rejected" | "archived" | string;
  visibility?: "public" | "private" | string;
  course_limit?: number;
};

export type ApiEnrollment = {
  id: string;
  course: string;
  course_title?: string;
  student: string;
  student_username?: string;
  status: "active" | "completed" | "cancelled" | string;
  enrolled_at?: string;
};

export const getCourses = (query = "") => apiRequest(`/api/courses/${query}`);
export const getEnrollments = (query = "") => apiRequest(`/api/enrollments/${query}`);
export const enrollInCourse = (courseId: string, studentId: string) =>
  apiRequest("/api/enrollments/", {
    method: "POST",
    body: JSON.stringify({ course: courseId, student: studentId }),
  });
export const createCourse = (payload: Record<string, unknown>) =>
  apiRequest("/api/courses/", { method: "POST", body: JSON.stringify(payload) });
