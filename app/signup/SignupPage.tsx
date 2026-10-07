"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LearnerSignup from "./learner/SignupForm";
import TeacherSignup from "./teacher/TeacherSignup";

export default function SignupPage() {
  const [role, setRole] = useState<"learner" | "teacher">("learner");
  const isTeacher = role === "teacher";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <section className={`relative flex min-h-[320px] flex-col items-center justify-start overflow-hidden bg-white px-6 pt-9 text-center md:min-h-screen md:w-[41%] ${isTeacher ? "md:pt-[6vh]" : "md:pt-[12vh]"}`}>
        {isTeacher ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src="/teachervideo.mp4" type="video/mp4" />
          </video>
        ) : (
          <Image src="/loginImage.png" alt="A learner studying with her laptop" fill priority sizes="(max-width: 767px) 100vw, 41vw" className="object-cover" />
        )}
        <div className={`absolute inset-0 ${isTeacher ? "bg-black/35" : "bg-gradient-to-b from-white/10 via-transparent to-white/5"}`} />
        <div className={`relative z-10 max-w-[320px] ${isTeacher ? "self-start text-left md:ml-[8%]" : "text-[#20271d]"}`}>
          {isTeacher ? (
            <>
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.04em] md:text-3xl">
                <span className="text-[#a9c37d]">Great teaching</span>{" "}
                <span className="text-white">starts</span>
                <br />
                <span className="text-[#a9c37d]">with trust.</span>
              </h2>
              <p className="mt-3 max-w-[300px] text-[0.65rem] leading-5 text-white/80">
                A considered review helps every learner meet qualified, supported educators.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.04em] md:text-[1.35rem]">
                A place to learn with<br />people, not beside them.
              </h2>
              <p className="mt-2 text-[0.58rem] text-[#84907a]">Small live classes · Verified educators · Clear progress</p>
            </>
          )}
        </div>
        <p className={`absolute bottom-4 left-4 z-10 text-[0.5rem] ${isTeacher ? "text-white/70" : "text-[#6c7469]"}`}>© 2026 Konnect Inc.</p>
        <nav aria-label="Account access" className="absolute right-0 top-1/2 z-20 hidden w-20 -translate-y-1/2 flex-col md:flex">
          <Link href="/login" className="flex min-h-11 items-center justify-center rounded-l-full text-[0.72rem] font-semibold uppercase text-[#27351f]">Log in</Link>
          <Link href="/signup" aria-current="page" className="flex min-h-11 items-center justify-center rounded-l-full bg-[#f8f7f1] text-[0.72rem] font-semibold uppercase text-[#27351f]">Sign up</Link>
        </nav>
      </section>

      <main className="flex min-h-[620px] flex-1 items-center justify-center bg-[#f8f7f1] px-6 py-8 text-[#20271d] dark:bg-[#10140f] dark:text-[#f4f4f0] sm:px-10 md:min-h-screen md:px-12 md:py-5">
        <div className="w-full">
          <div className="mb-7 flex justify-center">
            <Link href="/" aria-label="Konnect home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/konnect-wordmark.png" alt="Konnect" className="h-10 w-auto dark:brightness-0 dark:invert" />
            </Link>
          </div>
          {isTeacher ? (
            <TeacherSignup role={role} onRoleChange={setRole} />
          ) : (
            <div className="flex justify-center">
              <LearnerSignup onRoleChange={setRole} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
