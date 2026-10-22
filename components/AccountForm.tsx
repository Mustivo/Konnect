"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearNotice, loginWithRedux, setNotice } from "@/lib/redux/slices/authSlice";
import AuthMessage from "@/components/ui/AuthMessage";

type EnrollmentCourseSummary = {
  id: string;
  title: string;
  subject: string;
  teacher_name: string;
  description: string;
  banner_image: string | null;
  isDemo: boolean;
};

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export default function AccountForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notice, isLoading } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [selectedCourse, setSelectedCourse] = useState<EnrollmentCourseSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("courseId");
    if (courseId) {
      try {
        const storedCourse = JSON.parse(sessionStorage.getItem("konnect-enrollment-course") || "null") as EnrollmentCourseSummary | null;
        if (storedCourse?.id === courseId) setSelectedCourse(storedCourse);
      } catch {
        setSelectedCourse(null);
      }
    }
    const cleanAuthParams = () => {
      params.delete("registered");
      params.delete("role");
      params.delete("logged_out");
      params.delete("logout");
      const search = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
    };
    if (params.get("registered") === "1") {
      const role = params.get("role");
      const roleLabel = role === "teacher" ? "teacher" : "learner";
      dispatch(
        setNotice({
          type: "success",
          title: `${roleLabel[0].toUpperCase()}${roleLabel.slice(1)} registration submitted`,
          message: `Your ${roleLabel} account is waiting for administrator approval. You can sign in after your account is approved.`,
        })
      );
      cleanAuthParams();
    } else if (params.get("logged_out") === "1" || params.get("logout") === "1") {
      dispatch(
        setNotice({
          type: "success",
          title: "Logout successful",
          message: "You have been logged out successfully. Please sign in to access your classes and courses.",
        })
      );
      cleanAuthParams();
    } else if (notice?.title === "Welcome back!") {
      // Clear previous login success message when arriving on the login screen
      dispatch(clearNotice());
    }
  }, [dispatch]);

  const hasAuthError = notice?.type === "error";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearNotice());

    const formData = new FormData(event.currentTarget);
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      setFieldErrors({
        email: result.error.issues.find((issue) => issue.path[0] === "email")?.message,
        password: result.error.issues.find((issue) => issue.path[0] === "password")?.message,
      });
      return;
    }

    setFieldErrors({});

    const actionResult = await dispatch(
      loginWithRedux({
        email: result.data.email.trim().toLowerCase(),
        password: result.data.password,
      })
    );

    if (loginWithRedux.fulfilled.match(actionResult)) {
      const profile = actionResult.payload.user;
      const normalizedRole = String(profile.role ?? "").trim().toUpperCase();

      if (["ADMIN", "SUPERADMIN", "SUPER_ADMIN"].includes(normalizedRole)) {
        router.replace("/admin/dashboard");
      } else if (normalizedRole === "TEACHER") {
        router.replace("/teacher/dashboard");
      } else if (normalizedRole === "STUDENT" || normalizedRole === "LEARNER") {
        const courseId = new URLSearchParams(window.location.search).get("courseId");
        router.replace(courseId ? `/learner/courses/enroll?courseId=${encodeURIComponent(courseId)}` : "/learner/dashboard");
      } else {
        const courseId = new URLSearchParams(window.location.search).get("courseId");
        router.replace(courseId ? `/learner/courses/enroll?courseId=${encodeURIComponent(courseId)}` : "/learner/dashboard");
      }
    }
  };

  return (
    <main className="flex min-h-[620px] flex-1 items-center justify-center bg-[#f8f7f1] px-5 py-8 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-8 md:min-h-screen md:px-8 md:py-5">
      <div className="w-full max-w-[600px]">
        <div className="mb-7 flex justify-center">
          <Link href="/" aria-label="Konnect home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
          </Link>
        </div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
          Welcome back
        </p>
        <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
          Continue learning.
        </h1>
        <p className="mt-2 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
          {selectedCourse ? "Log in to continue with this course." : "Log in to join your next live class, revisit feedback, or keep building momentum."}
        </p>
        {selectedCourse && (
          <section className="mt-4 overflow-hidden rounded-lg border border-[#dfe5da] bg-white dark:border-white/10 dark:bg-white/5" aria-label="Selected course">
            {selectedCourse.banner_image && <img src={selectedCourse.banner_image} alt="" className="h-28 w-full object-cover" />}
            <div className="p-3">
              <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-[#687c50]">Selected course · {selectedCourse.subject}</p>
              <h2 className="mt-1 text-sm font-semibold">{selectedCourse.title}</h2>
              <p className="mt-1 text-[0.62rem] text-[#70786d]">Instructor: {selectedCourse.teacher_name}</p>
              <p className="mt-2 line-clamp-2 text-[0.62rem] leading-4 text-[#70786d]">{selectedCourse.description}</p>
            </div>
          </section>
        )}
        <p className="mt-2 text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">Email and password are required.</p>

        {/* Prominent Auth Alert / Return Message */}
        <AuthMessage
          notice={notice}
          onDismiss={() => dispatch(clearNotice())}
          className="my-4"
        />

        <form onSubmit={handleSubmit} method="POST" className="mt-4 space-y-3">
          <label className="block text-[0.65rem] font-medium">
            Email address
            <input
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              name="email"
              type="email"
              aria-invalid={Boolean(fieldErrors.email || hasAuthError)}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              onChange={() => {
                setFieldErrors((errors) => ({ ...errors, email: undefined }));
                if (hasAuthError || notice?.title === "Logout successful") dispatch(clearNotice());
              }}
              placeholder="you@example.com"
              className={`mt-1.5 w-full rounded border px-3 py-2.5 text-xs outline-none transition dark:bg-white/5 ${
                hasAuthError
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 dark:border-red-500/50"
                  : "border-[#e0e3d9] focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10"
              }`}
            />
            {fieldErrors.email && (
              <span id="login-email-error" className="mt-1 block text-[0.58rem] font-medium text-red-600">
                {fieldErrors.email}
              </span>
            )}
          </label>

          <label className="block text-[0.65rem] font-medium">
            Password
            <span
              className={`mt-1.5 flex rounded border transition dark:bg-white/5 ${
                hasAuthError
                  ? "border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20 dark:border-red-500/50"
                  : "border-[#e0e3d9] focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10"
              }`}
            >
              <input
                required
                autoComplete="current-password"
                name="password"
                type={showPassword ? "text" : "password"}
                aria-invalid={Boolean(fieldErrors.password || hasAuthError)}
                aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                onChange={() => {
                  setFieldErrors((errors) => ({ ...errors, password: undefined }));
                  if (hasAuthError || notice?.title === "Logout successful") dispatch(clearNotice());
                }}
                placeholder="Enter your password"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-3 text-[#65715e] transition hover:text-[#20271d] dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
            {fieldErrors.password && (
              <span id="login-password-error" className="mt-1 block text-[0.58rem] font-medium text-red-600">
                {fieldErrors.password}
              </span>
            )}
          </label>

          <div className="flex items-center justify-between text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="remember" className="h-3 w-3 accent-[#263d21]" />
              Remember me (optional)
            </label>
            <Link href="/forgot-password" className="font-medium text-[#526d43] hover:underline dark:text-[#b7cc9d]">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-[#263d21] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#344f2c] disabled:cursor-wait disabled:opacity-60 md:py-2.5 md:text-xs"
          >
            {isLoading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[0.58rem] text-[#82887e]">
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
          OR
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() =>
              dispatch(
                setNotice({
                  type: "info",
                  title: "Third-party sign-in",
                  message: "Google sign-in is coming soon to Konnect. Please use your email and password for now.",
                })
              )
            }
            className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f3f5ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="mr-2 font-bold text-[#4285f4]">G</span>Continue with Google
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                setNotice({
                  type: "info",
                  title: "Third-party sign-in",
                  message: "Apple sign-in is coming soon to Konnect. Please use your email and password for now.",
                })
              )
            }
            className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f3f5ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            Continue with Apple
          </button>
        </div>

        <p className="mt-4 text-center text-[0.62rem] text-[#70786d] dark:text-[#b0b8aa]">
          New to Konnect?{" "}
          <Link href={selectedCourse ? `/signup?courseId=${encodeURIComponent(selectedCourse.id)}` : "/signup"} className="font-semibold text-[#263d21] hover:underline dark:text-[#a8bd8c]">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
