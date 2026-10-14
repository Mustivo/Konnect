"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import RoleSelector from "../RoleSelector";
import { register } from "@/lib/api/auth";

type LearnerSignupProps = {
  onRoleChange: (role: "learner" | "teacher") => void;
};

export default function LearnerSignup({ onRoleChange }: LearnerSignupProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
    if (password !== passwordConfirm) {
      setNotice("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        email,
        username: email.replace(/[^a-z0-9@.+_-]/g, "").slice(0, 150),
        password,
        password_confirm: passwordConfirm,
        role: "LEARNER",
      });
      router.replace("/login?registered=1");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "We couldn’t create your account. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <RoleSelector role="learner" onChange={onRoleChange} />
        <label className="block text-[0.65rem] font-medium">
          Email address
          <input required autoComplete="email" name="email" type="email" placeholder="you@example.com" className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="block text-[0.65rem] font-medium">
          Password
          <span className="mt-1.5 flex rounded border border-[#e0e3d9] bg-white dark:border-white/10 dark:bg-white/5">
            <input required minLength={8} autoComplete="new-password" name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="px-3 text-[#65715e]">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </span>
        </label>
        <label className="block text-[0.65rem] font-medium">
          Confirm password
          <input required minLength={8} autoComplete="new-password" name="passwordConfirm" type="password" placeholder="Re-enter your password" className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-white/5" />
        </label>
        <label className="flex items-center gap-2 text-[0.58rem] leading-4 text-[#70786d] dark:text-[#b0b8aa]">
          <input required type="checkbox" name="terms" className="h-3 w-3 accent-[#263d21]" />
          <span>I agree to the <span className="font-semibold text-[#526d43]">Terms and Privacy Policy.</span></span>
        </label>
        <button type="submit" disabled={submitting} className="group relative flex min-h-12 w-full items-center justify-center rounded-lg bg-[#263d21] px-12 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60 md:min-h-10 md:rounded md:text-xs">
          {submitting ? "Creating account…" : "Create account"}
          <ArrowRight size={16} className="absolute right-4 md:hidden" />
        </button>
      </form>

      <div className="my-3 flex items-center gap-3 text-[0.58rem] text-[#82887e]">
        <span className="h-px flex-1 bg-[#e2e4db]" />OR<span className="h-px flex-1 bg-[#e2e4db]" />
      </div>
      <div className="space-y-2">
        <button type="button" onClick={() => setNotice("Google sign-in is not connected yet.")} className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] dark:border-white/10 dark:bg-white/5">
          <span className="mr-2 font-bold text-[#4285f4]">G</span>Sign up with Google
        </button>
        <button type="button" onClick={() => setNotice("Apple sign-in is not connected yet.")} className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] dark:border-white/10 dark:bg-white/5">
          Sign up with Apple
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-4 text-center text-[0.58rem] text-[#526d43]">{notice}</p>
      <p className="mt-2 text-center text-[0.62rem] text-[#70786d]">
        Already have an account? <Link href="/login" className="font-semibold text-[#263d21]">Log in</Link>
      </p>
    </div>
  );
}
