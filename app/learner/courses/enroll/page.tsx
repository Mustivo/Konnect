"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Check, Loader2 } from "lucide-react";
import { apiJson, currentUser, enrollInCourse } from "@/lib/api";
import { getCourseCatalog, type CourseCatalogItem } from "@/lib/courses/catalog";

type StoredCourse = CourseCatalogItem;

export default function CourseEnrollmentPage() {
  const router = useRouter();
  const [course, setCourse] = useState<CourseCatalogItem | null>(null);
  const [isLiveCourse, setIsLiveCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("courseId") || "";
    if (!window.localStorage.getItem("konnect-access-token")) {
      router.replace(`/login${id ? `?courseId=${encodeURIComponent(id)}` : ""}`);
      return;
    }

    if (!id) {
      setMessage("Choose a course from the catalogue to continue enrollment.");
      setLoading(false);
      return;
    }

    let active = true;
    void getCourseCatalog().then((catalog) => {
      if (!active) return;
      const match = catalog.find((item) => item.id === id);
      if (match) {
        setCourse(match);
        setIsLiveCourse(true);
      } else {
        try {
          const stored = JSON.parse(sessionStorage.getItem("konnect-enrollment-course") || "null") as StoredCourse | null;
          if (stored?.id === id) setCourse(stored);
        } catch {}
        setMessage("This course is no longer available in the live catalogue. You can browse other courses.");
      }
    }).catch(() => {
      if (active) setMessage("We could not load the course details. Please try again from the catalogue.");
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [router]);

  async function confirmEnrollment() {
    if (!course || !isLiveCourse || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const user = await currentUser();
      await apiJson(await enrollInCourse(course.id, String(user.id)));
      setEnrolled(true);
      sessionStorage.removeItem("konnect-enrollment-course");
      setMessage("Your enrollment request was submitted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not submit your enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Link href="/learner/courses" className="inline-flex items-center gap-2 text-[10px] font-semibold text-[#526744] hover:underline"><ArrowLeft size={13} /> Back to courses</Link>
      <header className="mt-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#687c50]">Course enrollment</p>
        <h1 className="mt-1 text-xl font-bold text-[#1b2219] dark:text-[#f0f4ee]">Review your course</h1>
        <p className="mt-1 text-[10px] text-[#70796b] dark:text-[#a6aea0]">Check the course information, then submit your enrollment request.</p>
      </header>

      {loading ? (
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#dfe5da] bg-white p-5 text-[11px] text-[#687463]"><Loader2 size={15} className="animate-spin" /> Loading course details…</div>
      ) : course ? (
        <article className="mt-5 overflow-hidden rounded-xl border border-[#dfe5da] bg-white dark:border-[#212f1f] dark:bg-[#141d13]">
          <div className="relative h-52 bg-[#e8eee3] dark:bg-[#263521]">
            {course.banner_image ? <img src={course.banner_image} alt={`${course.title} course`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#75816e]"><BookOpen size={34} /></div>}
            <span className="absolute bottom-3 left-3 rounded bg-black/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white">{course.subject}</span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#1b2219] dark:text-[#f0f4ee]">{course.title}</h2>
                <p className="mt-1 text-[10px] text-[#687463] dark:text-[#a6aea0]">Instructor: {course.teacher_name}</p>
              </div>
              {course.isDemo && <span className="rounded-full bg-[#f4eedb] px-2.5 py-1 text-[8px] font-semibold text-[#78622e]">Sample course</span>}
            </div>
            <p className="mt-4 whitespace-pre-line text-[11px] leading-6 text-[#58645b] dark:text-[#a6aea0]">{course.description}</p>
            {course.level && <p className="mt-3 text-[9px] text-[#687463] dark:text-[#9aa592]">Level: {course.level}</p>}

            {message && <p role="status" className={`mt-4 rounded-md px-3 py-2 text-[10px] ${enrolled ? "bg-[#eaf0e3] text-[#405b35]" : "bg-[#f4f5f1] text-[#58645b]"}`}>{message}</p>}

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-[#edf0e9] pt-4">
              <Link href="/learner/courses" className="inline-flex h-9 items-center rounded-md border border-[#dfe5da] px-3 text-[10px] font-semibold text-[#526044]">Cancel</Link>
              {enrolled ? (
                <Link href="/learner/dashboard" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-4 text-[10px] font-semibold text-white">View dashboard <ArrowRight size={13} /></Link>
              ) : (
                <button type="button" onClick={() => void confirmEnrollment()} disabled={!isLiveCourse || submitting} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#263d21] px-4 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {submitting ? "Submitting…" : isLiveCourse ? "Confirm enrollment" : "Not available for enrollment"}
                </button>
              )}
            </div>
          </div>
        </article>
      ) : (
        <div className="mt-5 rounded-lg border border-[#dfe5da] bg-white p-5 text-[11px] text-[#687463] dark:border-[#212f1f] dark:bg-[#141d13]">
          {message || "Course not found."} <Link href="/courses" className="ml-1 font-semibold text-[#405b35] underline">Browse courses</Link>
        </div>
      )}
    </div>
  );
}
