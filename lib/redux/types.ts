export type Role = "admin" | "teacher" | "student" | "ADMIN" | "TEACHER" | "LEARNER";

export interface ApiUser {
  id: number | string;
  name: string;
  email: string;
  role: Role;
  profile_image?: string | null;
  phone?: string | null;
  bio?: string | null;
  is_active?: boolean;
  created_at?: string;
  // Backward compatibility fields
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  student_number: string;
  date_of_birth?: string | null;
}

export interface AuthMessageState {
  type: "error" | "success" | "info" | "warning";
  title?: string;
  message: string;
  fieldErrors?: Record<string, string[] | string>;
  action?: {
    label: string;
    href?: string;
  };
}

export interface SchoolClass {
  id: number;
  name: string;
  grade: string;
  teacher?: number;
  description?: string;
  created_at: string;
}

export interface Announcement {
  id: number;
  author: number;
  school_class: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  school_class: number;
  teacher: number;
  title: string;
  description?: string;
  due_date?: string;
  created_at: string;
}

export interface LiveSession {
  id: number;
  school_class: number;
  title: string;
  meeting_link?: string;
  scheduled_at?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
