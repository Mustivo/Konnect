"use client";

import Link from "next/link";
import {
  CircleCheck,
  CircleHelp,
  Clock3,
  FileWarning,
  LockKeyhole,
  MessageCircle,
  UserRoundPlus,
} from "lucide-react";

type ApplicationStatusProps = {
  status: "pending" | "rejected" | "approved";
  submittedAt: Date;
  onContactSupport: () => void;
  onStartNewApplication: () => void;
};

function HelpLink() {
  return (
    <div className="mb-5 flex justify-end">
      <a href="/help" className="inline-flex items-center gap-1.5 text-[0.55rem] font-medium text-[#586853] hover:text-[#263d21]">
        <CircleHelp aria-hidden="true" className="h-3 w-3" />
        Need help?
      </a>
    </div>
  );
}

export default function ApplicationStatus({
  status,
  submittedAt,
  onContactSupport,
  onStartNewApplication,
}: ApplicationStatusProps) {
  if (status === "pending") {
    const submittedDate = submittedAt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return (
      <div className="mx-auto w-full max-w-[390px] text-[#20271d]">
        <HelpLink />
        <p className="text-[0.48rem] font-bold uppercase tracking-[0.12em] text-[#526d43]">Application status</p>
        <h1 className="mt-1 text-[1.23rem] font-semibold leading-tight tracking-[-0.04em]">Your application is under review.</h1>
        <p className="mt-1 text-[0.52rem] leading-4 text-[#858b80]">
          Thanks for applying. Our instructor review team is checking your information.
        </p>
        <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e9eee3] text-[#a5985f]">
          <Clock3 aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.4} />
        </div>
        <div className="mt-3.5 grid grid-cols-2 rounded-md border border-[#e4e5dd] bg-white px-2.5 py-2 text-[0.45rem]">
          <div>
            <p className="text-[#858b80]">Submitted</p>
            <p className="mt-0.5 font-semibold text-[#30392e]">{submittedDate}</p>
          </div>
          <div className="text-right">
            <p className="text-[#858b80]">Typical review time</p>
            <p className="mt-0.5 font-semibold text-[#30392e]">3–5 business days</p>
          </div>
        </div>
        <section className="mt-2.5 rounded-lg border border-[#e4e5dd] bg-white px-3 py-2.5 text-[0.46rem] leading-4 shadow-[0_3px_10px_rgba(35,45,32,0.04)]">
          <h2 className="font-semibold text-[#30392e]">What happens next</h2>
          <ul className="mt-1.5 space-y-1 text-[#7b8377]">
            <li className="flex gap-1.5"><span className="text-[#263d21]">•</span><span>We verify your identity and qualifications.</span></li>
            <li className="flex gap-1.5"><span className="text-[#263d21]">•</span><span>We may email you if a document needs clarification.</span></li>
            <li className="flex gap-1.5"><span className="text-[#263d21]">•</span><span>You&apos;ll receive an email as soon as a decision is ready.</span></li>
          </ul>
        </section>
        <p className="mt-2.5 flex items-center gap-1.5 rounded-md bg-[#e9efe3] px-2.5 py-2 text-[0.43rem] leading-4 text-[#737d6c]">
          <LockKeyhole aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={1.5} />
          Teaching tools become available only after an administrator approves your application.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onContactSupport}
            className="flex h-7 items-center justify-center gap-1.5 rounded-md border border-[#e2e4dc] text-[0.46rem] font-medium text-[#30392e] transition hover:bg-white"
          >
            <MessageCircle aria-hidden="true" className="h-3 w-3" />
            Contact instructor support
          </button>
          <Link href="/login" className="flex h-7 items-center justify-center rounded-md border border-[#e2e4dc] text-[0.46rem] font-medium text-[#30392e] transition hover:bg-white">
            Sign out
          </Link>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="mx-auto w-full max-w-[390px] text-[#20271d]">
        <HelpLink />
        <p className="text-[0.48rem] font-bold uppercase tracking-[0.12em] text-[#526d43]">Application status</p>
        <h1 className="mt-1 text-[1.23rem] font-semibold leading-tight tracking-[-0.04em]">
          We couldn&apos;t approve this application.
        </h1>
        <p className="mt-1 text-[0.52rem] leading-4 text-[#858b80]">
          This decision is about the information provided—not your potential as an educator.
        </p>
        <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eee7] text-[#b27366]">
          <FileWarning aria-hidden="true" className="h-[17px] w-[17px]" />
        </div>
        <section className="mt-2.5 rounded-lg border border-[#e4e5dd] bg-white px-3 py-2.5 text-[0.46rem] leading-4">
          <h2 className="font-semibold text-[#30392e]">Reason for this decision</h2>
          <p className="mt-1.5 text-[#7b8377]">
            We couldn&apos;t verify the submitted qualification because the degree certificate was cropped and the issuing institution wasn&apos;t visible.
          </p>
        </section>
        <section className="mt-2.5 rounded-md bg-[#f1f0e8] px-3 py-2.5 text-[0.46rem] leading-4">
          <h2 className="font-semibold text-[#30392e]">What you can correct</h2>
          <p className="mt-1 text-[#7b8377]">
            Prepare a full, readable scan that shows your name, award, institution, and graduation date. Make sure your legal name matches your ID.
          </p>
        </section>
        <div className="mt-2.5 rounded-md bg-[#e9efe3] px-2.5 py-2 text-[0.44rem] text-[#45553d]">
          <p className="font-semibold">Questions about the decision?</p>
          <p>Contact instructor support</p>
        </div>
        <button
          type="button"
          onClick={onStartNewApplication}
          className="mt-2.5 flex h-7 w-full items-center justify-center gap-1.5 rounded-md bg-[#263d21] text-[0.48rem] font-semibold text-white hover:bg-[#1e311a]"
        >
          <UserRoundPlus aria-hidden="true" className="h-3 w-3" />
          Create a new account
        </button>
        <p className="mt-2 text-center text-[0.42rem] leading-4 text-[#858b80]">
          Use a new application to submit corrected information and documents.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[390px] text-[#20271d]">
      <HelpLink />
      <p className="text-[0.48rem] font-bold uppercase tracking-[0.12em] text-[#526d43]">Application approved</p>
      <h1 className="mt-1 text-[1.3rem] font-semibold leading-tight tracking-[-0.04em]">Welcome to Konnect.</h1>
      <p className="mt-1 text-[0.52rem] leading-4 text-[#858b80]">
        Your instructor account is approved and your teaching workspace is ready.
      </p>
      <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e9eee3] text-[#526d43]">
        <CircleCheck aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.4} />
      </div>
      <div className="mt-3 rounded-lg border border-[#e4e5dd] bg-white px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9eee3] text-[0.5rem] font-semibold text-[#34452f]">K</div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.48rem] font-semibold text-[#30392e]">Instructor</p>
            <p className="text-[0.42rem] text-[#858b80]">Verified instructor</p>
          </div>
          <span className="rounded-full bg-[#e9efe3] px-2 py-1 text-[0.38rem] font-semibold uppercase text-[#526d43]">Approved</span>
        </div>
      </div>
      <p className="mt-2.5 text-[0.44rem] leading-4 text-[#858b80]">
        You can build your public profile, create live classes, manage availability, and use the full Teacher Portal.
      </p>
      <Link
        href="/teacher/dashboard"
        className="mt-2.5 flex h-7 w-full items-center justify-center gap-1.5 rounded-md bg-[#263d21] text-[0.48rem] font-semibold text-white hover:bg-[#1e311a]"
      >
        Go to Teacher Portal
      </Link>
      <p className="mt-2 rounded-md bg-[#f1f0e8] px-2.5 py-2 text-[0.43rem] leading-4 text-[#737d6c]">
        Your verification badge will appear on your instructor profile. Need help getting started? Visit the Instructor Guide.
      </p>
    </div>
  );
}
