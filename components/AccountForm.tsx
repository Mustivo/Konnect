"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

type AccountFormProps = {
  mode: "login" | "signup";
  accountRole: "learner" | "teacher";
  setAccountRole: (role: "learner" | "teacher") => void;
};

export default function AccountForm({ mode, accountRole, setAccountRole }: AccountFormProps) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const isTeacher = accountRole === "teacher";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(
      isTeacher
        ? "Instructor account setup will be available once authentication is connected."
        : isLogin
        ? "Your account sign-in will be available once authentication is connected."
        : "Learner account creation will be available once authentication is connected.",
    );
  };

  return (
    <main className="flex min-h-[620px] flex-1 items-center justify-center bg-[#f8f7f1] px-6 py-8 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-10 md:min-h-screen md:px-12 md:py-5">
      <div className={`w-full ${isTeacher ? "max-w-[640px]" : "max-w-[420px]"}`}>
        <div className="mb-7 flex justify-center">
          <Link href="/" aria-label="Konnect home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
          </Link>
        </div>

        {isTeacher && (
          <div className="mb-4 flex items-center text-[0.55rem] text-[#6c7469] dark:text-[#b0b8aa]">
            {["Account", "Profile", "Documents", "Review"].map((step, index) => (
              <div key={step} className="flex flex-1 items-center gap-2 last:flex-none">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${index === 0 ? "border-[#263d21] bg-[#263d21] font-semibold text-white" : "border-[#dfe5d8] bg-white dark:border-white/20 dark:bg-white/5"}`}>
                  {index + 1}
                </span>
                <span className={index === 0 ? "font-semibold text-[#20271d] dark:text-[#f4f4f0]" : ""}>{step}</span>
                {index < 3 && <span className="mx-1 h-px flex-1 bg-[#dfe5d8] dark:bg-white/10" />}
              </div>
            ))}
          </div>
        )}
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
          {isTeacher ? "Instructor application" : isLogin ? "Welcome back" : "Join Konnect"}
        </p>
        <h1 className="mt-1.5 text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
          {isTeacher ? "Create your instructor account." : isLogin ? "Continue learning." : "Start with your role."}
        </h1>
        <p className="mt-2 max-w-[370px] text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
          {isTeacher
            ? "Set up secure sign-in details. You can review everything before submitting."
            : isLogin
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
                      className={`flex min-h-[54px] flex-col justify-center cursor-pointer rounded border px-3 py-2 transition ${
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
                          ? "Join classes and track progress"
                          : "Create and lead live classes"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {isTeacher && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="block text-[0.65rem] font-medium">
                Full legal name
                <input required autoComplete="name" name="fullName" placeholder="Maya Lin Chen" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5" />
              </label>
              <label className="block text-[0.65rem] font-medium">
                Professional display name
                <input required name="displayName" placeholder="Maya Chen" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5" />
              </label>
            </div>
          )}

          <div className={isTeacher ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "contents"}>
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

          {isTeacher && (
            <label className="block text-[0.65rem] font-medium">
              Phone number
              <input required autoComplete="tel" name="phone" type="tel" placeholder="+1 415 555 0184" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs outline-none focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5" />
            </label>
          )}
          </div>

          {isTeacher && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="block text-[0.65rem] font-medium">
                  Country
                  <select required name="country" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#10140f]">
                    <option value="" disabled>Select your country</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="block text-[0.65rem] font-medium">
                  Timezone
                  <select required name="timezone" defaultValue="" className="mt-1 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2 text-xs outline-none focus:border-[#526d43] dark:border-white/10 dark:bg-[#10140f]">
                    <option value="" disabled>Select your timezone</option>
                    <option value="America/Los_Angeles">(UTC-08:00) Pacific Time</option>
                    <option value="America/Denver">(UTC-07:00) Mountain Time</option>
                    <option value="America/Chicago">(UTC-06:00) Central Time</option>
                    <option value="America/New_York">(UTC-05:00) Eastern Time</option>
                    <option value="Europe/London">(UTC+00:00) London</option>
                    <option value="Europe/Paris">(UTC+01:00) Central European Time</option>
                    <option value="Asia/Tokyo">(UTC+09:00) Japan Standard Time</option>
                  </select>
                </label>
            </div>
          )}

          <div className={isTeacher ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "contents"}>
          <label className="block text-[0.65rem] font-medium">
            Password
            <span className="mt-1.5 flex rounded border border-[#e0e3d9] bg-white transition focus-within:border-[#526d43] focus-within:ring-2 focus-within:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5">
              <input
                required
                autoComplete={isLogin && !isTeacher ? "current-password" : "new-password"}
                minLength={isLogin && !isTeacher ? undefined : isTeacher ? 12 : 8}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={isTeacher ? "At least 12 characters" : isLogin ? "Enter your password" : "At least 8 characters"}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs outline-none placeholder:text-[#8b9188]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-3 text-[#65715e] transition hover:text-[#263d21] dark:text-[#b0b8aa]"
              >
                {isTeacher ? (showPassword ? "Hide" : "Show") : showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
            {isTeacher && <span className="mt-1 block text-[0.5rem] font-normal text-[#84907a]">Strong password</span>}
          </label>

          {isTeacher && (
            <label className="block text-[0.65rem] font-medium">
              Confirm password
              <span className="mt-1 flex rounded border border-[#e0e3d9] bg-white dark:border-white/10 dark:bg-white/5">
                <input required minLength={12} autoComplete="new-password" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter your password" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs outline-none placeholder:text-[#8b9188]" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide passwords" : "Show passwords"} className="px-3 text-[0.6rem] text-[#65715e] transition hover:text-[#263d21] dark:text-[#b0b8aa]">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </span>
              <span className="mt-1 block text-[0.5rem] font-normal text-[#84907a]">Passwords match</span>
            </label>
          )}
          </div>

          {isTeacher && (
            <div className="grid grid-cols-2 gap-2 rounded bg-[#f0f1e9] px-3 py-2 text-[0.5rem] text-[#70786d] sm:grid-cols-4 dark:bg-white/5 dark:text-[#b0b8aa]">
              <span>✓&nbsp; 12+ characters</span>
              <span>✓&nbsp; Upper &amp; lowercase</span>
              <span>✓&nbsp; Number</span>
              <span>✓&nbsp; Symbol</span>
            </div>
          )}

          {(!isLogin || isTeacher) && (
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

          {isLogin && !isTeacher && (
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

          <div className={isTeacher ? "grid grid-cols-1 gap-2 sm:grid-cols-3" : ""}>
            <button
              type="submit"
              className="group relative flex min-h-12 w-full items-center justify-center rounded-lg bg-[#263d21] px-12 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(38,61,33,0.18)] transition hover:bg-[#344f2c] hover:shadow-[0_10px_22px_rgba(38,61,33,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] active:scale-[0.99] md:min-h-10 md:rounded md:px-4 md:text-xs md:shadow-none md:hover:shadow-none md:active:scale-100"
            >
              {isTeacher ? "Continue to teaching profile" : isLogin ? "Log in" : "Create account"}
              <ArrowRight
                size={16}
                className="absolute right-4 transition-transform group-hover:translate-x-0.5 md:hidden"
              />
            </button>
            {isTeacher && (
              <>
                <button
                  type="button"
                  onClick={() => setNotice("Google sign-in is not connected yet.")}
                  className="flex w-full items-center justify-center gap-2 rounded border border-[#e0e3d9] px-3 py-2.5 text-[0.65rem] transition hover:bg-[#f2f4ee] dark:border-white/10 dark:hover:bg-white/10"
                >
                  <span aria-hidden="true" className="font-bold text-[#4285f4]">G</span>
                  Sign up with Google
                </button>
                <button
                  type="button"
                  onClick={() => setNotice("Apple sign-in is not connected yet.")}
                  className="flex w-full items-center justify-center gap-2 rounded border border-[#e0e3d9] px-3 py-2.5 text-[0.65rem] transition hover:bg-[#f2f4ee] dark:border-white/10 dark:hover:bg-white/10"
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
                    <path d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.5a3 3 0 0 0-2.4-1.3c-1 0-1.5.5-2.2.5-.6 0-1.2-.5-2-.5a3.2 3.2 0 0 0-2.7 1.7c-1.1 1.9-.3 4.8.8 6.4.5.8 1.1 1.6 1.9 1.6.7 0 .9-.5 1.9-.5s1.2.5 2 .5 1.3-.8 1.8-1.6c.4-.6.7-1.2.9-1.9a2.8 2.8 0 0 1-1.4-2.4ZM9.7 3.7c.5-.6.8-1.3.7-2.1-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2 .8.1 1.5-.3 2-1Z" />
                  </svg>
                  Sign up with Apple
                </button>
              </>
            )}
          </div>
        </form>

        {!isTeacher && <div className="my-3 flex items-center gap-3 text-[0.58rem] text-[#82887e] dark:text-[#969f91]">
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
          OR
          <span className="h-px flex-1 bg-[#e2e4db] dark:bg-white/10" />
        </div>}

        {!isTeacher && <div className="space-y-2">
          <button
            type="button"
            onClick={() => setNotice("Google sign-in is not connected yet.")}
            className={`flex w-full items-center justify-center gap-2 rounded border border-[#e0e3d9] bg-white px-4 py-2.5 text-[0.65rem] transition hover:bg-[#f2f4ee] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 ${isTeacher ? "sm:col-span-1" : ""}`}
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
        </div>}

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
