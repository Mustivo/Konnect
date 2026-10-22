import { apiRequest } from "./client";

export const getClassAssessments = (classId: string, query = "") => apiRequest(`/api/assessments/class/${encodeURIComponent(classId)}/${query}`);
export const createAssessment = (classId: string, payload: Record<string, unknown>) => apiRequest(`/api/assessments/class/${encodeURIComponent(classId)}/`, { method: "POST", body: JSON.stringify({ ...payload, class_room: classId }) });
export const getAssessment = (id: string) => apiRequest(`/api/assessments/${encodeURIComponent(id)}/`);
export const updateAssessment = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/assessments/${encodeURIComponent(id)}/`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteAssessment = (id: string) => apiRequest(`/api/assessments/${encodeURIComponent(id)}/`, { method: "DELETE" });
export const getAssessmentSubmissions = (assessmentId: string, query = "") => apiRequest(`/api/assessments/${encodeURIComponent(assessmentId)}/submissions/${query}`);
export const submitAssessment = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/assessments/${encodeURIComponent(id)}/submit/`, { method: "POST", body: JSON.stringify(payload) });
// The live API scopes this list to the authenticated student.
export const getMyAssessmentSubmissions = (query = "") => apiRequest(`/api/submissions/${query}`);
export const gradeAssessmentSubmission = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/assessments/submissions/${encodeURIComponent(id)}/grade/`, { method: "POST", body: JSON.stringify(payload) });
