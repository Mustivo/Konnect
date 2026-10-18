"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { z } from "zod";
import AuthMessage from "@/components/ui/AuthMessage";

const resetSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email address."),
    newPassword: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type PasswordRecoveryProps = {
  mode: "forgot" | "reset-success";
};

export default function PasswordRecovery({ mode }: PasswordRecoveryProps) {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(mode === "reset-success");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notice, setNotice] = useState<{
    type: "error" | "success" | "info";
    title?: string;
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const result = resetSchema.safeParse({ email, newPassword, confirmPassword });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = String(issue.path[0]);
        if (!errors[path]) errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, new_password: newPassword }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setNotice({
          type: "error",
          title: "Password reset failed",
          message: data?.error || data?.detail || "Could not reset your password. Please try again.",
        });
        setSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setNotice({
        type: "error",
        title: "Connection error",
        message: "Failed to connect to the authentication server. Please check your internet connection.",
      });
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[500px] flex-1 items-center justify-center bg-[#f8f7f1] px-6 py-12 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-10 md:min-h-screen md:px-12 md:py-8">
      {isSuccess ? (
        <section className="w-full max-w-[520px] rounded-[2rem] border border-[#e1e6db] bg-white p-8 text-center shadow-[0_20px_50px_rgba(29,45,25,0.06)] dark:border-white/10 dark:bg-[#161b17] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-950/20">
            <CheckCircle2 size={28} strokeWidth={2.4} />
          </div>

          <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#607954] dark:text-[#a8bd8c]">
            Account security
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2rem]">
            Password updated!
          </h1>
          <p className="mx-auto mt-2.5 max-w-[360px] text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
            Your password has been successfully reset. You can now use your new password to sign in to your Konnect account.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 w-full max-w-[320px] items-center justify-center rounded-lg bg-[#273a23] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1e2e1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43]"
          >
            Log in with new password &rarr;
          </Link>
        </section>
      ) : (
        <section className="w-full max-w-[440px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#dfe5d8] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#52644a] transition hover:border-[#b9c9ac] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-[#c5d6bc] dark:hover:bg-white/10"
          >
            <ArrowLeft size={13} />
            Back to Home
          </Link>

          <div className="mb-6 flex justify-center sm:justify-start">
            <Link href="/" aria-label="Konnect home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/konnect-wordmark.png" alt="Konnect" className="h-9 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e4ede0] text-[#344d2d] dark:bg-[#253621] dark:text-[#b4ceaa]">
              <KeyRound size={13} />
            </span>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#607954] dark:text-[#a8bd8c]">
              Password Reset
            </p>
          </div>

          <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2rem]">
            Reset your password.
          </h1>
          <p className="mt-1.5 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
            Enter your account email and choose a new password of at least 8 characters.
          </p>

          <AuthMessage notice={notice} onDismiss={() => setNotice(null)} className="my-4" />

          <form onSubmit={handleSubmit} method="POST" className="mt-4 space-y-3.5">
            <div>
              <label className="block text-[0.68rem] font-medium" htmlFor="reset-email">
                Account email address
              </label>
              <input
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`mt-1.5 w-full rounded border px-3 py-2.5 text-xs outline-none transition dark:bg-white/5 ${
                  fieldErrors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-[#e0e3d9] focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10"
                }`}
              />
              {fieldErrors.email && (
                <span className="mt-1 block text-[0.62rem] text-red-600 dark:text-red-400">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[0.68rem] font-medium" htmlFor="new-password">
                New password (min 8 characters)
              </label>
              <div
                className={`mt-1.5 flex rounded border transition dark:bg-white/5 ${
                  fieldErrors.newPassword
                    ? "border-red-300 focus-within:border-red-500"
                    : "border-[#e0e3d9] focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10"
                }`}
              >
                <input
                  required
                  id="new-password"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="px-3 text-[#70786d] hover:text-[#20271d] dark:text-[#a0a89d] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <span className="mt-1 block text-[0.62rem] text-red-600 dark:text-red-400">
                  {fieldErrors.newPassword}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[0.68rem] font-medium" htmlFor="confirm-password">
                Confirm new password
              </label>
              <div
                className={`mt-1.5 flex rounded border transition dark:bg-white/5 ${
                  fieldErrors.confirmPassword
                    ? "border-red-300 focus-within:border-red-500"
                    : "border-[#e0e3d9] focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10"
                }`}
              >
                <input
                  required
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-type new password"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="px-3 text-[#70786d] hover:text-[#20271d] dark:text-[#a0a89d] dark:hover:text-white"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="mt-1 block text-[0.62rem] text-red-600 dark:text-red-400">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#263d21] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#344f2c] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43]"
            >
              {submitting ? "Updating password…" : "Reset password"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-[#526d43] hover:underline dark:text-[#a8bd8c]">
              Log in
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
