"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Check } from "lucide-react";

type PasswordRecoveryProps = {
  mode: "forgot" | "reset-success";
};

export default function PasswordRecovery({ mode }: PasswordRecoveryProps) {
  const isSuccess = mode === "reset-success";
  const [notice, setNotice] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(
      "Password reset email delivery is not connected yet. Connect an authentication provider to send reset links.",
    );
  };

  return (
    <main className="flex min-h-[500px] flex-1 items-center justify-center bg-[#f8f7f1] px-6 py-12 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-10 md:min-h-screen md:px-12 md:py-8">
      {isSuccess ? (
        <section className="w-full max-w-[620px] rounded-[2.5rem] bg-white px-7 py-12 text-center shadow-[0_20px_60px_rgba(29,45,25,0.04)] dark:bg-[#171c18] sm:px-12 md:py-16">
          <Link
            href="/"
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#dfe5d8] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#52644a] transition hover:border-[#b9c9ac] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] dark:border-white/10 dark:bg-white/5 dark:text-[#c5d6bc] dark:hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            Back to main site
          </Link>
          <div className="mb-10 flex justify-center opacity-40">
            <Link href="/" aria-label="Konnect home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
            All set
          </p>
          <h1 className="mx-auto mt-2 max-w-[430px] text-[1.8rem] font-semibold leading-tight tracking-[-0.055em] sm:text-[2rem]">
            Your password has been reset.
          </h1>
          <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf0e5] text-[#42653a] dark:bg-[#263d21] dark:text-[#c5d6bc]">
            <Check size={19} />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
            You can now use your new password to return to Konnect and continue learning.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex min-h-11 w-full max-w-[360px] items-center justify-center rounded bg-[#263d21] px-4 text-xs font-semibold text-white transition hover:bg-[#344f2c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43]"
          >
            Return to login
          </Link>
          <p className="mt-4 text-[0.58rem] text-[#70786d] dark:text-[#b0b8aa]">
            Still having trouble?{" "}
            <Link href="/contact" className="font-semibold text-[#526d43] hover:underline dark:text-[#b7cc9d]">
              Contact support
            </Link>
          </p>
        </section>
      ) : (
        <section className="w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dfe5d8] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#52644a] transition hover:border-[#b9c9ac] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43] dark:border-white/10 dark:bg-white/5 dark:text-[#c5d6bc] dark:hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            Back to main site
          </Link>
          <div className="mb-12 flex justify-center">
            <Link href="/" aria-label="Konnect home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>
          <p className="text-[0.58rem] font-bold uppercase tracking-[0.17em] text-[#687c50] dark:text-[#a8bd8c]">
            Password help
          </p>
          <h1 className="mt-2 max-w-[360px] text-[1.9rem] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-[2.15rem]">
            We’ll help you get back in.
          </h1>
          <p className="mt-3 max-w-[390px] text-xs leading-5 text-[#6c7469] dark:text-[#b0b8aa]">
            Enter the email linked to your Konnect account. If we find a match, we’ll send a secure reset link that expires in 30 minutes.
          </p>
          <form onSubmit={handleSubmit} className="mt-5">
            <label className="block text-[0.65rem] font-medium" htmlFor="recovery-email">
              Email address
            </label>
            <input
              required
              autoComplete="email"
              id="recovery-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded border border-[#e0e3d9] bg-white px-3 py-2.5 text-xs outline-none transition placeholder:text-[#8b9188] focus:border-[#526d43] focus:ring-2 focus:ring-[#526d43]/10 dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="submit"
              className="mt-3 min-h-11 w-full rounded bg-[#263d21] px-4 text-xs font-semibold text-white transition hover:bg-[#344f2c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526d43]"
            >
              Send reset link
            </button>
          </form>
          <p aria-live="polite" className="mt-3 min-h-8 text-center text-[0.62rem] leading-4 text-[#526d43] dark:text-[#b7cc9d]">
            {notice}
          </p>
          <p className="mt-1 text-center text-[0.65rem]">
            <Link href="/login" className="font-semibold text-[#526d43] hover:underline dark:text-[#b7cc9d]">
              + Return to login
            </Link>
          </p>
        </section>
      )}
    </main>
  );
}
