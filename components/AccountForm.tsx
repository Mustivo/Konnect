"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

type AccountFormProps = {
  mode: "login" | "signup";
};

export default function AccountForm({ mode }: AccountFormProps) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [accountRole, setAccountRole] = useState<"learner" | "teacher">("learner");
  const [notice, setNotice] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(
      isLogin
        ? "Your account sign-in will be available once authentication is connected."
        : `${accountRole === "learner" ? "Learner" : "Teacher"} account creation will be available once authentication is connected.`,
    );
  };

  return (
    <main className="flex min-h-[620px] flex-1 items-center justify-center bg-[#f8f7f1] px-6 py-8 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-10 md:min-h-screen md:px-12 md:py-5">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dfe5d8] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#52644a] shadow-sm transition hover:border-[#b9c9ac] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] dark:border-white/10 dark:bg-white/5 dark:text-[#c5d6bc] dark:hover:bg-white/10"
        >
          <ArrowLeft size={14} />
          Back to main site
        </Link>
        <div className="mb-5 flex justify-center">
          <Link href="/" aria-label="Konnect home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
          </Link>
        </div>

        <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
          {isLogin ? "Welcome back" : "Join Konnect"}
        </p>
        <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
          {isLogin ? "Continue learning." : "Start with your role."}
        </h1>
        <p className="mt-2 max-w-[370px] text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
          {isLogin
            ? "Log in to join your next live class, revisit feedback, or keep building momentum."
            : "Create a focused account and get connected in less than two minutes."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {!isLogin && (
            <fieldset>
              <legend className="sr-only">Choose your account role</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["learner", "teacher"] as const).map((role) => {
                  const isSelected = accountRole === role;

                  return (
                    <label
                      key={role}
                      className={`flex min-h-[62px] cursor-pointer flex-col justify-center rounded border px-3 py-2 transition ${
                        isSelected
                          ? "border-[#526d43] bg-[#edf2e8] ring-1 ring-[#526d43]/20 dark:bg-[#263d21]/40"
                          : "border-[#e0e3d9] bg-white hover:border-[#b9c9ac] dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="role"
                        value={role}
                        checked={isSelected}
                        onChange={() => setAccountRole(role)}
                      />
                      <span className="text-xs font-semibold capitalize">{role}</span>
                      <span className="mt-0.5 text-[0.55rem] leading-4 text-[#6c7469] dark:text-[#b0b8aa]">
                        {role === "learner"
                          ? "Learn new skills and grow"
                          : "Teach what you know"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="block text-[0.65rem] font-medium">
            Email address
            <input
              required
              autoComplete="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none transition placeholder:text-[#8b9188] focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <label className="block text-[0.65rem] font-medium">
            Password
            <span className="mt-1.5 flex rounded border border-[#e0e3d9] bg-white transition focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5">
              <input
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 8}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-[#8b9188]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-3 text-[#65715e] transition hover:text-[#263d21] dark:text-[#b0b8aa]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
          </label>

          {!isLogin && (
            <label className="flex items-center gap-2 text-[0.58rem] leading-4 text-[#70786d] dark:text-[#b0b8aa]">
              <input
                required
                type="checkbox"
                name="terms"
                className="h-3 w-3 shrink-0 accent-[#263d21]"
              />
              <span>
                I agree to the <span className="font-semibold text-[#526d43] dark:text-[#b7cc9d]">Terms and Privacy Policy.</span>
              </span>
            </label>
          )}

          {isLogin && (
            <div className="flex items-center justify-between pt-0.5 text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-3 w-3 accent-[#263d21]"
                />
                Remember me on this device
              </label>
              <Link
                href="/forgot-password"
                className="font-medium text-[#526d43] hover:underline dark:text-[#b7cc9d]"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="group relative flex min-h-12 w-full items-center justify-center rounded-lg bg-[#263d21] px-12 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(38,61,33,0.18)] transition hover:bg-[#344f2c] hover:shadow-[0_10px_22px_rgba(38,61,33,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] active:scale-[0.99] md:min-h-10 md:rounded md:px-4 md:text-xs md:shadow-none md:hover:shadow-none md:active:scale-100"
          >
            {isLogin ? "Log in" : "Create account"}
            <ArrowRight
              size={16}
              className="absolute right-4 transition-transform group-hover:translate-x-0.5 md:hidden"
            />
          </button>
        </form>

        <div className="my-3 flex items-center gap-3 text-[0.58rem] text-[#82887e] dark:text-[#969f91]">
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
          OR
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setNotice("Google sign-in is not connected yet.")}
            className="flex w-full items-center justify-center gap-2 rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f2f4ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span aria-hidden="true" className="text-sm font-bold text-[#4285f4]">G</span>
            {isLogin ? "Continue with Google" : "Sign up with Google"}
          </button>
          <button
            type="button"
            onClick={() => setNotice("Apple sign-in is not connected yet.")}
            className="flex w-full items-center justify-center gap-2 rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f2f4ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
              <path d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.5a3 3 0 0 0-2.4-1.3c-1 0-1.5.5-2.2.5-.6 0-1.2-.5-2-.5a3.2 3.2 0 0 0-2.7 1.7c-1.1 1.9-.3 4.8.8 6.4.5.8 1.1 1.6 1.9 1.6.7 0 .9-.5 1.9-.5s1.2.5 2 .5 1.3-.8 1.8-1.6c.4-.6.7-1.2.9-1.9a2.8 2.8 0 0 1-1.4-2.4ZM9.7 3.7c.5-.6.8-1.3.7-2.1-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-1Z" />
            </svg>
            {isLogin ? "Continue with Apple" : "Sign up with Apple"}
          </button>
        </div>

        <p aria-live="polite" className="mt-2 min-h-4 text-center text-[0.58rem] leading-4 text-[#526d43] dark:text-[#b7cc9d]">
          {notice}
        </p>
        <p className="mt-2 text-center text-[0.62rem] text-[#70786d] dark:text-[#b0b8aa]">
          {isLogin ? "New to Konnect? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-semibold text-[#263d21] hover:underline dark:text-[#c5d6bc]"
          >
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
