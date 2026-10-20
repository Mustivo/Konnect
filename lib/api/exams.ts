import { apiRequest } from "./client";

export interface LiveExamItem {
  id: string;
  course: string;
  course_title?: string;
  teacher_name?: string;
  title: string;
  exam_date: string;
  duration_minutes: number;
  total_marks: number;
}

export const getExams = () => apiRequest("/api/exams/");

export const getExamById = (id: string) =>
  apiRequest(`/api/exams/${encodeURIComponent(id)}/`);

export const createExam = (payload: Partial<LiveExamItem>) =>
  apiRequest("/api/exams/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
