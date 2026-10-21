import { apiRequest } from "./client";

export type ApiExam = {
  id: string;
  course: string;
  course_title: string;
  teacher_name: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
};

export type CreateExamPayload = Pick<ApiExam, "course" | "title" | "exam_date" | "duration_minutes" | "total_marks">;

export const getExams = () => apiRequest("/api/exams/");
export const getExam = (id: string) => apiRequest(`/api/exams/${encodeURIComponent(id)}/`);
export const createExam = (payload: CreateExamPayload) => apiRequest("/api/exams/", {
  method: "POST",
  body: JSON.stringify(payload),
});
