import { apiRequest } from "./client";

export const getAnnouncements = (query = "") => apiRequest(`/api/communication/announcements/${query}`);
export const createAnnouncement = (payload: Record<string, unknown>) => apiRequest("/api/communication/announcements/", { method: "POST", body: JSON.stringify(payload) });
export const getCalendarEvents = (query = "") => apiRequest(`/api/communication/calendar/events/${query}`);
export const getNotifications = (query = "") => apiRequest(`/api/communication/notifications/${query}`);
export const markNotificationRead = (id: string) => apiRequest(`/api/communication/notifications/${encodeURIComponent(id)}/read/`, { method: "PATCH", body: JSON.stringify({}) });
export const markAllNotificationsRead = () => apiRequest("/api/communication/notifications/mark-all-read/", { method: "POST", body: JSON.stringify({}) });
export const getSupportTickets = () => apiRequest("/api/communication/support/tickets/");
export const createSupportTicket = (payload: Record<string, unknown>) => apiRequest("/api/communication/support/tickets/", { method: "POST", body: JSON.stringify(payload) });
export const getSupportTicket = (id: string) => apiRequest(`/api/communication/support/tickets/${encodeURIComponent(id)}/`);
export const replyToSupportTicket = (id: string, payload: Record<string, unknown>) => apiRequest(`/api/communication/support/tickets/${encodeURIComponent(id)}/reply/`, { method: "POST", body: JSON.stringify(payload) });