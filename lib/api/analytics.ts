import { apiRequest } from "./client";

export const getTeacherAnalytics = (query = "") => apiRequest(`/api/analytics/teacher/reports-analytics/${query}`);
export const getAdminAnalytics = (query = "") => apiRequest(`/api/analytics/admin/reports-analytics/${query}`);
export const getPlatformHealth = () => apiRequest("/api/analytics/admin/platform-health/");