"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiErrorMessage, apiRequest } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function AccountForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const loginResponse = await apiRequest("/api/auth/login/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      const tokens = await loginResponse.json().catch(() => null) as { access?: string; refresh?: string } | null;

      if (!loginResponse.ok || !tokens?.access || !tokens.refresh) {
        setNotice(apiErrorMessage(tokens, "We couldn’t sign you in. Check your email and password."));
        return;
      }

      window.localStorage.setItem("konnect-access-token", tokens.access);
      window.localStorage.setItem("konnect-refresh-token", tokens.refresh);

      const profileResponse = await apiRequest("/api/auth/me/");
      const profile = await profileResponse.json().catch(() => null) as { role?: string; user_type?: string } | null;
      if (!profileResponse.ok) {
        window.localStorage.removeItem("konnect-access-token");
        window.localStorage.removeItem("konnect-refresh-token");
        setNotice(apiErrorMessage(profile, "We couldn’t load your account. Please try again."));
        return;
      }

      const normalizedRole = String(profile?.role ?? profile?.user_type ?? "").trim().toUpperCase();
      if (normalizedRole === "TEACHER") router.replace("/teacher/dashboard");
      else if (normalizedRole === "LEARNER") router.replace("/learner/dashboard");
      else setNotice("Your account role is not supported by this portal.");
    } catch {
      setNotice("We couldn’t reach the Konnect API. Please try again in a moment.");
    } finally {
      setSubmitting(false);
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
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">Welcome back</p>
        <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">Continue learning.</h1>
        <p className="mt-2 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
          Log in to join your next live class, revisit feedback, or keep building momentum.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-[0.65rem] font-medium">
            Email address
            <input required autoComplete="email" name="email" type="email" placeholder="you@example.com" className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-white/5" />
          </label>
          <label className="block text-[0.65rem] font-medium">
            Password
            <span className="mt-1.5 flex rounded border border-[#e0e3d9] bg-white dark:border-white/10 dark:bg-white/5">
              <input required autoComplete="current-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="px-3 text-[#65715e]">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
          </label>
          <div className="flex items-center justify-between text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">
            <label className="inline-flex items-center gap-2"><input type="checkbox" name="remember" className="h-3 w-3 accent-[#263d21]" />Remember me on this device</label>
            <Link href="/forgot-password" className="font-medium text-[#526d43] dark:text-[#b7cc9d]">Forgot password?</Link>
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded bg-[#263d21] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#344f2c] disabled:cursor-wait disabled:opacity-60 md:py-2.5 md:text-xs">{submitting ? "Signing in…" : "Log in"}</button>
        </form>

        <div className="my-3 flex items-center gap-3 text-[0.58rem] text-[#82887e]"><span className="h-px flex-1 bg-[#e2e4db]" />OR<span className="h-px flex-1 bg-[#e2e4db]" /></div>
        <div className="space-y-2">
          <button type="button" onClick={() => setNotice("Google sign-in is not connected yet.")} className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] dark:border-white/10 dark:bg-white/5"><span className="mr-2 font-bold text-[#4285f4]">G</span>Continue with Google</button>
          <button type="button" onClick={() => setNotice("Apple sign-in is not connected yet.")} className="w-full rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] dark:border-white/10 dark:bg-white/5">Continue with Apple</button>
        </div>
        <p aria-live="polite" className="mt-2 min-h-4 text-center text-[0.58rem] text-[#526d43]">{notice}</p>
        <p className="mt-2 text-center text-[0.62rem] text-[#70786d]">New to Konnect? <Link href="/signup" className="font-semibold text-[#263d21]">Sign up</Link></p>
      </div>
    </main>
  );
}
