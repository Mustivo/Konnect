"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import RoleSelector from "../RoleSelector";
import { useAppDispatch } from "@/lib/redux/hooks";
import { registerWithRedux } from "@/lib/redux/slices/authSlice";
import type { AuthMessageState } from "@/lib/redux/types";
import AuthMessage from "@/components/ui/AuthMessage";

type LearnerSignupProps = {
  onRoleChange: (role: "learner" | "teacher") => void;
};

export default function LearnerSignup({ onRoleChange }: LearnerSignupProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<AuthMessageState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (!name) {
      setNotice({
        type: "error",
        title: "Name is required",
        message: "Please enter your full name to set up your learner account.",
      });
      return;
    }

    if (password !== passwordConfirm) {
      setNotice({
        type: "error",
        title: "Passwords do not match",
        message: "The password and confirm password fields must match exactly. Please check and re-type them.",
      });
      return;
    }

    if (password.length < 8) {
      setNotice({
        type: "error",
        title: "Password is too short",
        message: "Your password must be at least 8 characters long and not entirely numeric.",
      });
      return;
    }

    setSubmitting(true);

    // Auto-generate student identifier if not explicitly provided
    const studentNumber = `STU-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await dispatch(
      registerWithRedux({
        name,
        email,
        password,
        password_confirm: passwordConfirm,
        student_number: studentNumber,
      })
    );

    if (registerWithRedux.fulfilled.match(result)) {
      const courseId = new URLSearchParams(window.location.search).get("courseId");
      const enrollmentQuery = courseId ? `&courseId=${encodeURIComponent(courseId)}` : "";
      router.replace(`/login?registered=1&role=learner${enrollmentQuery}`);
    } else {
      setNotice(
        result.payload ?? {
          type: "error",
          title: "Registration failed",
          message: "We couldn’t create your account. Please review your details and try again.",
        }
      );
      setSubmitting(false);
    }
  };

  const hasError = notice?.type === "error";

  return (
    <div className="w-full max-w-[600px]">
      <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
        Join Konnect
      </p>
      <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
        Start with your role.
      </h1>
      <p className="mt-2 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
        Create a focused account and get connected in less than two minutes.
      </p>
      <p className="mt-2 text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">All fields are required.</p>

      {/* Prominent Auth Alert / Return Message */}
      <AuthMessage
        notice={notice}
        onDismiss={() => setNotice(null)}
        className="my-3.5"
      />

      <form onSubmit={handleSubmit} method="POST" className="mt-4 space-y-3">
        <RoleSelector role="learner" onChange={onRoleChange} />

        <label className="block text-[0.65rem] font-medium">
          Full name
          <input
            required
            autoComplete="name"
            name="name"
            type="text"
            placeholder="Alex Johnson"
            onChange={() => {
              if (hasError) setNotice(null);
            }}
            className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5"
          />
        </label>

        <label className="block text-[0.65rem] font-medium">
          Email address
          <input
            required
            autoComplete="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={() => {
              if (hasError) setNotice(null);
            }}
            className={`mt-1.5 w-full rounded border px-3 py-2.5 text-xs outline-none transition dark:bg-white/5 ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-400/20 dark:border-red-500/50"
                : "border-[#e0e3d9] bg-white focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10"
            }`}
          />
        </label>

        <label className="block text-[0.65rem] font-medium">
          Password
          <span
            className={`mt-1.5 flex rounded border transition dark:bg-white/5 ${
              hasError
                ? "border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20 dark:border-red-500/50"
                : "border-[#e0e3d9] bg-white focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10"
            }`}
          >
            <input
              required
              minLength={8}
              autoComplete="new-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              onChange={() => {
                if (hasError) setNotice(null);
              }}
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
        </label>

        <label className="block text-[0.65rem] font-medium">
          Confirm password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            name="passwordConfirm"
            type="password"
            placeholder="Re-enter your password"
            onChange={() => {
              if (hasError) setNotice(null);
            }}
            className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5"
          />
        </label>

        <label className="flex items-center gap-2 text-[0.58rem] leading-4 text-[#70786d] dark:text-[#b0b8aa]">
          <input required type="checkbox" name="terms" className="h-3 w-3 accent-[#263d21]" />
          <span>
            I agree to the <span className="font-semibold text-[#526d43]">Terms and Privacy Policy.</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="group relative flex min-h-12 w-full items-center justify-center rounded-lg bg-[#263d21] px-12 text-sm font-semibold text-white shadow-sm transition hover:bg-[#344f2c] disabled:cursor-wait disabled:opacity-60 md:min-h-10 md:rounded md:text-xs"
        >
          {submitting ? "Creating account…" : "Create account"}
          <ArrowRight size={16} className="absolute right-4 md:hidden" />
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
            setNotice({
              type: "info",
              title: "Third-party sign-up",
              message: "Google sign-up is coming soon. Please use email registration for now.",
            })
          }
          className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f3f5ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <span className="mr-2 font-bold text-[#4285f4]">G</span>Sign up with Google
        </button>
        <button
          type="button"
          onClick={() =>
            setNotice({
              type: "info",
              title: "Third-party sign-up",
              message: "Apple sign-up is coming soon. Please use email registration for now.",
            })
          }
          className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f3f5ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          Sign up with Apple
        </button>
      </div>

      <p className="mt-4 text-center text-[0.62rem] text-[#70786d] dark:text-[#b0b8aa]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#263d21] hover:underline dark:text-[#a8bd8c]">
          Log in
        </Link>
      </p>
    </div>
  );
}
