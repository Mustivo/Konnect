import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiUser,
  Announcement,
  Assignment,
  LiveSession,
  LoginCredentials,
  NotificationItem,
  PaginatedResponse,
  RegisterData,
  SchoolClass,
  TokenPair,
} from "./types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // In browser, use same-origin relative URL so Next.js catch-all proxy routes smoothly without CORS
    return "";
  }
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "https://konnect-k0x2.onrender.com";
  try {
    const parsed = new URL(envUrl);
    const sanitizedPath = parsed.pathname
      .replace(/\/(swagger|api\/docs|docs|api)\/?.*$/i, "")
      .replace(/\/+$/, "");
    parsed.pathname = sanitizedPath || "/";
    parsed.search = "";
    parsed.hash = "";
    return `${parsed.origin}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return "https://konnect-k0x2.onrender.com";
  }
}

export const konnectApi = createApi({
  reducerPath: "konnectApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("konnect-access-token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Class", "Announcement", "Assignment", "LiveSession", "Notification"],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<TokenPair, LoginCredentials>({
      query: (credentials) => ({
        url: "/api/auth/token/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<TokenPair, { refresh: string }>({
      query: (body) => ({
        url: "/api/auth/token/refresh/",
        method: "POST",
        body,
      }),
    }),

    register: builder.mutation<Partial<RegisterData>, RegisterData>({
      query: (data) => ({
        url: "/api/auth/register/",
        method: "POST",
        body: data,
      }),
    }),

    getMe: builder.query<ApiUser, void>({
      query: () => "/api/users/me/",
      providesTags: ["User"],
    }),

    // Classroom & Learning resources
    getClasses: builder.query<PaginatedResponse<SchoolClass> | SchoolClass[], void>({
      query: () => "/api/classes/",
      providesTags: ["Class"],
    }),

    getClassById: builder.query<SchoolClass, number | string>({
      query: (id) => `/api/classes/${id}/`,
      providesTags: (_res, _err, id) => [{ type: "Class", id }],
    }),

    getAnnouncements: builder.query<PaginatedResponse<Announcement> | Announcement[], void>({
      query: () => "/api/announcements/",
      providesTags: ["Announcement"],
    }),

    getAssignments: builder.query<PaginatedResponse<Assignment> | Assignment[], void>({
      query: () => "/api/assignments/",
      providesTags: ["Assignment"],
    }),

    getLiveSessions: builder.query<PaginatedResponse<LiveSession> | LiveSession[], void>({
      query: () => "/api/live-sessions/",
      providesTags: ["LiveSession"],
    }),

    getNotifications: builder.query<PaginatedResponse<NotificationItem> | NotificationItem[], void>({
      query: () => "/api/notifications/",
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetClassesQuery,
  useGetClassByIdQuery,
  useGetAnnouncementsQuery,
  useGetAssignmentsQuery,
  useGetLiveSessionsQuery,
  useGetNotificationsQuery,
} = konnectApi;
