import { apiRequest } from "./client";

export const interactWithAssistant = (payload: Record<string, unknown>) => apiRequest("/api/future/ai/interact/", { method: "POST", body: JSON.stringify(payload) });
export const getFinancialReports = () => apiRequest("/api/future/financial-reports/");
export const getPayments = () => apiRequest("/api/future/payments/");
export const createPayment = (payload: Record<string, unknown>) => apiRequest("/api/future/payments/", { method: "POST", body: JSON.stringify(payload) });