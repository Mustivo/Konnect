import { apiJson, apiRequest } from "./client";

export type PendingTeacher = {
  id: string;
  userId: string;
  name: string;
  email: string;
  subject: string;
  qualification: string;
  submittedAt: string;
  documentCount: number;
  accountStatus: string;
};

export type PendingAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

export function normalizePendingTeachers(payload: unknown): PendingTeacher[] {
  const root = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(root.results)
      ? root.results
      : Array.isArray(root.teachers)
        ? root.teachers
        : Array.isArray(root.pending_teachers)
          ? root.pending_teachers
          : [];

  return rows.map((value) => {
    const row = asRecord(value);
    const user = asRecord(row.user);
    const profile = asRecord(row.teacher_profile);
    const userId = firstText(row.user_id, user.id, row.account_id, row.id);
    const name = firstText(
      row.full_name,
      row.name,
      row.display_name,
      user.full_name,
      user.name,
      `${firstText(user.first_name, row.first_name)} ${firstText(user.last_name, row.last_name)}`.trim(),
      row.email,
      user.email,
    ) || "Unnamed teacher";
    const subjects = row.subjects_expertise ?? row.subjects ?? row.subject ?? profile.subjects_expertise ?? profile.subjects;
    const documentList = row.documents ?? row.credentials ?? profile.documents ?? profile.credentials;

    return {
      id: firstText(row.teacher_id, row.profile_id, profile.id, row.id),
      userId,
      name,
      email: firstText(row.email, user.email),
      subject: Array.isArray(subjects) ? subjects.map(String).join(", ") : firstText(subjects),
      qualification: firstText(row.qualification, row.qualifications, row.education, row.education_level, profile.qualification, profile.education_level),
      submittedAt: firstText(row.created_at, row.submitted_at, row.application_date, profile.created_at),
      documentCount: Array.isArray(documentList) ? documentList.length : Number(row.document_count ?? profile.document_count ?? 0) || 0,
      accountStatus: firstText(row.account_status, row.status, user.account_status, user.status).toUpperCase(),
    };
  }).filter((teacher) => teacher.id && teacher.userId);
}

export async function getPendingTeachers() {
  const response = await apiRequest("/api/admin/teachers/pending-verification/");
  return normalizePendingTeachers(await apiJson<unknown>(response));
}

export async function getPendingAccounts(): Promise<PendingAccount[]> {
  const response = await apiRequest("/api/admin/pending-users/");
  const payload = await apiJson<unknown>(response);
  const root = asRecord(payload);
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(root.results)
      ? root.results
      : Array.isArray(root.pending_users)
        ? root.pending_users
        : Array.isArray(root.users)
          ? root.users
          : [];

  return rows.map((value) => {
    const row = asRecord(value);
    const user = asRecord(row.user);
    const name = firstText(
      row.full_name,
      row.name,
      user.full_name,
      user.name,
      `${firstText(row.first_name, user.first_name)} ${firstText(row.last_name, user.last_name)}`.trim(),
    );
    return {
      id: firstText(row.id, row.user_id, user.id, row.account_id),
      name: name || "Name not provided",
      email: firstText(row.email, user.email),
      role: firstText(row.role, user.role, row.account_type) || "Account",
      status: firstText(row.account_status, row.status, user.account_status, user.status) || "Pending",
    };
  }).filter((account) => account.id || account.email);
}

export const approvePendingUser = (userId: string) =>
  apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/approve/`, {
    method: "POST",
  });

export const rejectPendingUser = (userId: string) =>
  apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/reject/`, {
    method: "POST",
  });

export const verifyTeacher = (teacherId: string) =>
  apiRequest(`/api/admin/teachers/${encodeURIComponent(teacherId)}/verify/`, {
    method: "POST",
  });

export const rejectPendingTeacher = (userId: string) =>
  rejectPendingUser(userId);
