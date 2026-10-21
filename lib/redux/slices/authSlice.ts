import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ApiUser, AuthMessageState, LoginCredentials, RegisterData, TokenPair } from "../types";
import { currentUser as getCurrentUser, login as apiLogin, register as apiRegister } from "../../api/auth";

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

function loginFailureMessage(payload: unknown): string {
  const backendMessage = parseApiErrorMessage(payload, "").trim();
  const normalized = backendMessage.toLowerCase();

  if (/(email|account|user).{0,40}(not found|does not exist|isn't registered|not registered)/.test(normalized)) {
    return "We couldn't find an account for that email address. Check the spelling or create an account first.";
  }
  if (/(password|credentials).{0,40}(incorrect|invalid|wrong|don't match|do not match)/.test(normalized)) {
    return "The password doesn't match this account. Check it and try again, or reset your password.";
  }
  if (/(pending|awaiting|inactive|not active|no active account|not approved|unapproved).{0,60}(approval|administrator|admin|activation|active|verification)?|(?:approval|administrator|admin).{0,60}(pending|awaiting|required)/.test(normalized)) {
    return "This account is waiting for administrator approval. Ask a superadmin to open Admin → Teacher Approvals → Pending learner accounts and approve it, then sign in again.";
  }

  return "We couldn't sign you in with these credentials. Check the password. If it is correct, the account may be inactive or still awaiting approval.";
}

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "https://konnect-k0x2.onrender.com";
  try {
    const parsed = new URL(envUrl);
    const sanitizedPath = parsed.pathname
      .replace(/\/(swagger|api\/docs|docs|api)\/?.*$/i, "")
      .replace(/\/+$/, "");
    return `${parsed.origin}${sanitizedPath || ""}`;
  } catch {
    return "https://konnect-k0x2.onrender.com";
  }
}

function getApiEndpoint(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (typeof window !== "undefined") {
    return cleanEndpoint;
  }
  const baseUrl = getBaseUrl();
  return `${baseUrl}${cleanEndpoint}`;
}

export const loginWithRedux = createAsyncThunk<
  { tokens: TokenPair; user: ApiUser },
  LoginCredentials,
  { rejectValue: AuthMessageState }
>("auth/loginWithRedux", async (credentials, { rejectWithValue }) => {
  let tokenReceived = false;
  try {
    const tokens = await apiLogin(credentials.email.trim().toLowerCase(), credentials.password);
    tokenReceived = true;

    if (typeof window !== "undefined") {
      const email = String(credentials.email || "").trim().toLowerCase();
      window.localStorage.setItem("konnect-access-token", tokens.access);
      window.localStorage.setItem("konnect-refresh-token", tokens.refresh);
      if (email) {
        window.localStorage.setItem("konnect-user-email", email);
        document.cookie = `konnect-user-email=${email}; path=/; max-age=604800; SameSite=Lax`;
      }
      document.cookie = `konnect-access-token=${tokens.access}; path=/; max-age=604800; SameSite=Lax`;
    }

    const user = await getCurrentUser(credentials.email.trim().toLowerCase()) as unknown as ApiUser;
    user.name = user.name || `${user.first_name} ${user.last_name}`.trim() || user.username || user.email;
    if (!user.first_name && user.name) {
      const parts = user.name.split(" ");
      user.first_name = parts[0] || "";
      user.last_name = parts.slice(1).join(" ") || "";
    }
    user.first_name = user.first_name || "";
    user.last_name = user.last_name || "";
    user.username = user.username || user.email.split("@")[0];

    if (typeof window !== "undefined" && user?.email) {
      window.localStorage.setItem("konnect-user-email", user.email);
      window.localStorage.setItem("konnect-user", JSON.stringify(user));
      document.cookie = `konnect-user-email=${user.email}; path=/; max-age=604800; SameSite=Lax`;
    }

    return { tokens, user };
  } catch (error) {
    const apiError = error as { status?: number; payload?: unknown };
    if (tokenReceived && typeof window !== "undefined") {
      window.localStorage.removeItem("konnect-access-token");
      window.localStorage.removeItem("konnect-refresh-token");
      window.localStorage.removeItem("konnect-user-email");
      window.localStorage.removeItem("konnect-user");
      document.cookie = "konnect-access-token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "konnect-user-email=; path=/; max-age=0; SameSite=Lax";
    }
    if (apiError.status === 401) {
      return rejectWithValue({
        type: "error",
        title: "Unable to sign in",
        message: loginFailureMessage(apiError.payload),
        action: { label: "Forgot your password?", href: "/forgot-password" },
      });
    }
    return rejectWithValue({
      type: "error",
      title: tokenReceived ? "Account profile unavailable" : "Unable to sign in",
      message: error instanceof Error ? error.message : "We couldn’t reach the Konnect server. Please check your internet connection.",
    });
  }
});

export const registerWithRedux = createAsyncThunk<
  Partial<RegisterData>,
  RegisterData,
  { rejectValue: AuthMessageState }
>("auth/registerWithRedux", async (payload, { rejectWithValue }) => {
  try {
    const [firstName, ...lastNameParts] = payload.name.trim().split(/\s+/);
    const email = payload.email.trim().toLowerCase();
    const username = `${email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 16) || "learner"}_${Math.random().toString(36).slice(2, 6)}`;
    const data = await apiRegister({
      ...payload,
      email,
      username,
      role: "LEARNER",
      full_name: payload.name.trim(),
      first_name: firstName || "Learner",
      last_name: lastNameParts.join(" "),
    });
    return data as unknown as Partial<RegisterData>;
  } catch (error) {
    const apiError = error as { payload?: unknown };
    return rejectWithValue({
      type: "error",
      title: "Could not create account",
      message: parseApiErrorMessage(apiError.payload, error instanceof Error ? error.message : "Unable to reach the registration server. Please try again in a moment."),
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
        window.localStorage.removeItem("konnect-user-email");
        window.localStorage.removeItem("konnect-user");
        document.cookie = "konnect-access-token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "konnect-user-email=; path=/; max-age=0; SameSite=Lax";
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
