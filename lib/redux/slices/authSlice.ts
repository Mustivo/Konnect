import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiUser, AuthMessageState, LoginCredentials, RegisterData, TokenPair } from "../types";

interface AuthState {
  user: ApiUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notice: AuthMessageState | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: typeof window !== "undefined" ? window.localStorage.getItem("konnect-access-token") : null,
  refreshToken: typeof window !== "undefined" ? window.localStorage.getItem("konnect-refresh-token") : null,
  isAuthenticated: typeof window !== "undefined" ? Boolean(window.localStorage.getItem("konnect-access-token")) : false,
  isLoading: false,
  notice: null,
};

function parseApiErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return fallback;
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  if (Array.isArray(obj.detail)) return obj.detail.map(String).join(" ");
  const messages: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const formattedKey = key.replace(/_/g, " ");
    if (Array.isArray(value)) {
      messages.push(`${formattedKey}: ${value.join(", ")}`);
    } else if (typeof value === "string") {
      messages.push(`${formattedKey}: ${value}`);
    }
  }
  return messages.length > 0 ? messages.join(". ") : fallback;
}

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "https://konnect-classroomvirtual.onrender.com";
  try {
    const parsed = new URL(envUrl);
    const sanitizedPath = parsed.pathname.replace(/\/swagger\/?.*$/i, "").replace(/\/+$/, "");
    return `${parsed.origin}${sanitizedPath || ""}`;
  } catch {
    return "https://konnect-classroomvirtual.onrender.com";
  }
}

export const loginWithRedux = createAsyncThunk<
  { tokens: TokenPair; user: ApiUser },
  LoginCredentials,
  { rejectValue: AuthMessageState }
>("auth/loginWithRedux", async (credentials, { rejectWithValue }) => {
  const baseUrl = getBaseUrl();

  try {
    const tokenResponse = await fetch(`${baseUrl}/api/auth/token/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const tokenData = await tokenResponse.json().catch(() => null);

    if (!tokenResponse.ok) {
      if (tokenResponse.status === 401) {
        return rejectWithValue({
          type: "error",
          title: "Incorrect email or password",
          message: "The email address or password you entered doesn’t match our records. Please verify your credentials and try again.",
          action: {
            label: "Forgot your password?",
            href: "/forgot-password",
          },
        });
      }

      const parsedMessage = parseApiErrorMessage(tokenData, "Sign in failed. Please verify your details.");
      return rejectWithValue({
        type: "error",
        title: "Unable to sign in",
        message: parsedMessage,
      });
    }

    const tokens = tokenData as TokenPair;

    if (typeof window !== "undefined") {
      window.localStorage.setItem("konnect-access-token", tokens.access);
      window.localStorage.setItem("konnect-refresh-token", tokens.refresh);
    }

    // Fetch user profile
    const userResponse = await fetch(`${baseUrl}/api/users/me/`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokens.access}`,
      },
    });

    if (!userResponse.ok) {
      const userErr = await userResponse.json().catch(() => null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("konnect-access-token");
        window.localStorage.removeItem("konnect-refresh-token");
      }
      return rejectWithValue({
        type: "error",
        title: "Account profile unavailable",
        message: parseApiErrorMessage(userErr, "We could not load your user profile. Please try logging in again."),
      });
    }

    const user = (await userResponse.json()) as ApiUser;
    return { tokens, user };
  } catch (error) {
    return rejectWithValue({
      type: "error",
      title: "Connection error",
      message: error instanceof Error ? error.message : "We couldn’t reach the Konnect server. Please check your internet connection.",
    });
  }
});

export const registerWithRedux = createAsyncThunk<
  Partial<RegisterData>,
  RegisterData,
  { rejectValue: AuthMessageState }
>("auth/registerWithRedux", async (payload, { rejectWithValue }) => {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/api/auth/register/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const fieldErrors: Record<string, string[] | string> = {};
      if (data && typeof data === "object") {
        for (const [key, val] of Object.entries(data)) {
          if (Array.isArray(val)) {
            fieldErrors[key] = val.map(String);
          } else if (typeof val === "string") {
            fieldErrors[key] = val;
          }
        }
      }

      const formatted = parseApiErrorMessage(data, "Registration could not be completed. Please review your details.");
      return rejectWithValue({
        type: "error",
        title: "Could not create account",
        message: formatted,
        fieldErrors,
      });
    }

    return data as Partial<RegisterData>;
  } catch (error) {
    return rejectWithValue({
      type: "error",
      title: "Connection error",
      message: error instanceof Error ? error.message : "Unable to reach the registration server. Please try again in a moment.",
    });
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setNotice: (state, action: PayloadAction<AuthMessageState | null>) => {
      state.notice = action.payload;
    },
    clearNotice: (state) => {
      state.notice = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ access: string; refresh: string; user?: ApiUser }>
    ) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("konnect-access-token", action.payload.access);
        window.localStorage.setItem("konnect-refresh-token", action.payload.refresh);
      }
    },
    setUser: (state, action: PayloadAction<ApiUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.notice = null;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("konnect-access-token");
        window.localStorage.removeItem("konnect-refresh-token");
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginWithRedux.pending, (state) => {
        state.isLoading = true;
        state.notice = null;
      })
      .addCase(loginWithRedux.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.notice = {
          type: "success",
          title: "Welcome back!",
          message: "Signed in successfully. Redirecting you to your dashboard…",
        };
      })
      .addCase(loginWithRedux.rejected, (state, action) => {
        state.isLoading = false;
        state.notice = action.payload ?? {
          type: "error",
          title: "Sign in error",
          message: "An unexpected error occurred during sign in.",
        };
      });

    // Register
    builder
      .addCase(registerWithRedux.pending, (state) => {
        state.isLoading = true;
        state.notice = null;
      })
      .addCase(registerWithRedux.fulfilled, (state) => {
        state.isLoading = false;
        state.notice = {
          type: "success",
          title: "Account created successfully!",
          message: "Your learning account is ready. You can now log in with your email and password.",
        };
      })
      .addCase(registerWithRedux.rejected, (state, action) => {
        state.isLoading = false;
        state.notice = action.payload ?? {
          type: "error",
          title: "Registration error",
          message: "Could not create your account. Please check your information.",
        };
      });
  },
});

export const { setNotice, clearNotice, setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
