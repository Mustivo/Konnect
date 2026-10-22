"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiJson, currentUser, enrollInCourse, getCourses, getEnrollments, getLearnerClasses } from "@/lib/api";
import { BookOpen, Check, ChevronDown, Video } from "lucide-react";
import { mockCourses } from "@/lib/mock/courses";

type ApiCourse = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  subject?: string;
  category?: string;
  teacher_name?: string;
  instructor?: string;
  banner_image?: string | null;
  image?: string | null;
  status?: string;
  visibility?: string;
  isDemo?: boolean;
};

type ApiEnrollment = {
  id: string;
  course?: string | { id?: string };
  class_room?: string;
  course_title?: string;
  class_title?: string;
  class_subject?: string;
  teacher_name?: string;
  status: string;
};

type ApiCollection<T> = T[] | { results?: T[]; next?: string | null };
type Course = ApiCourse & {
  title: string;
  enrollmentStatus: string | null;
  isDemo?: boolean;
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending approval",
  ENROLLED: "Enrolled",
  COMPLETED: "Completed",
  DROPPED: "Available",
};

function courseIdFromEnrollment(enrollment: ApiEnrollment) {
  if (enrollment.class_room) return enrollment.class_room;
  return typeof enrollment.course === "string" ? enrollment.course : String(enrollment.course?.id || "");
}

function enrollmentStatusLabel(status?: string) {
  switch ((status || "").toLowerCase()) {
    case "active": return "ENROLLED";
    case "completed": return "COMPLETED";
    case "cancelled": return "DROPPED";
    default: return status ? status.toUpperCase() : "PENDING";
  }
}

async function getAllPages<T>(requestPage: (query?: string) => Promise<Response>) {
  const records: T[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const response = await requestPage(page === 1 ? "" : `?page=${page}`);
    const result = await apiJson<ApiCollection<T>>(response);
    if (Array.isArray(result)) {
      records.push(...result);
      break;
    }
    records.push(...(result.results ?? []));
    if (!result.next) break;
  }
  return records;
}

async function getEnrollmentRecords() {
  const [remoteResult, localResult] = await Promise.allSettled([
    getAllPages<ApiEnrollment>(getEnrollments),
    getAllPages<ApiEnrollment>(getLearnerClasses),
  ]);
  const records = [
    ...(localResult.status === "fulfilled" ? localResult.value : []),
    ...(remoteResult.status === "fulfilled" ? remoteResult.value : []),
  ];
  const byId = new Map<string, ApiEnrollment>();
  for (const enrollment of records) {
    const id = courseIdFromEnrollment(enrollment);
    if (id) byId.set(id, enrollment);
  }
  if (remoteResult.status === "rejected" && localResult.status === "rejected") throw remoteResult.reason;
  return [...byId.values()];
}

export default function LearnerCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All courses");
  const [selectedCategory, setSelectedCategory] = useState("All subjects");
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [activeLiveClass, setActiveLiveClass] = useState<{ sessionId: string; classId?: string; courseTitle?: string } | null>(null);

  useEffect(() => {
    function checkLive() {
      try {
        const raw = localStorage.getItem("konnect-active-live-session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.sessionId && parsed.status !== "ENDED") {
            if (!parsed.lastHeartbeat || Date.now() - parsed.lastHeartbeat < 45000) {
              setActiveLiveClass(parsed);
              return;
            }
          }
        }
      } catch {}
      setActiveLiveClass(null);
    }
    checkLive();

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("konnect-live-classes");
        channel.onmessage = (event) => {
          if (event.data?.type === "session-started" && event.data.session) {
            setActiveLiveClass(event.data.session);
          } else if (event.data?.type === "session-ended") {
            setActiveLiveClass(null);
          }
        };
        channel.postMessage({ type: "is-teacher-live-query" });
      } catch {}
    }

    const interval = setInterval(checkLive, 3000);
    return () => {
      clearInterval(interval);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadCourses() {
      if (!window.localStorage.getItem("konnect-access-token")) {
        router.replace("/login");
        return;
      }
      try {
        const [catalogResult, enrollmentsResult] = await Promise.allSettled([
          getAllPages<ApiCourse>(getCourses),
          getEnrollmentRecords(),
        ]);
        if (!active) return;

        const catalog = catalogResult.status === "fulfilled" ? catalogResult.value : [];
        const enrollments = enrollmentsResult.status === "fulfilled" ? enrollmentsResult.value : [];
        const usingMockCourses = catalog.length === 0;
        const availableCourses: ApiCourse[] = usingMockCourses ? mockCourses : catalog;
        const enrollmentsByClass = new Map<string, ApiEnrollment>();
        for (const enrollment of enrollments) {
          const id = courseIdFromEnrollment(enrollment);
          if (id) {
            enrollmentsByClass.set(id, enrollment);
            enrollmentsByClass.set(`demo-${id}`, enrollment);
          }
        }
        const classesById = new Map(availableCourses.map((course) => [course.id, course]));
        for (const enrollment of enrollments) {
          const id = courseIdFromEnrollment(enrollment);
          if (id && !classesById.has(id) && !classesById.has(`demo-${id}`) && enrollmentStatusLabel(enrollment.status) !== "DROPPED") {
            classesById.set(id, {
              id,
              title: enrollment.course_title || enrollment.class_title || "Course",
              subject: enrollment.class_subject,
              teacher_name: "Mutiti Stivo",
              banner_image: null,
            });
          }
        }

        setCourses([...classesById.values()].map((course) => ({
          ...course,
          title: course.title || course.name || "Course",
          subject: course.subject || course.category,
          teacher_name: "Mutiti Stivo",
          banner_image: course.banner_image || course.image || null,
          enrollmentStatus: enrollmentsByClass.has(course.id)
            ? enrollmentStatusLabel(enrollmentsByClass.get(course.id)?.status)
            : null,
        })));
        if (usingMockCourses && catalogResult.status === "rejected") {
          setNotice(`Live courses could not be loaded (${catalogResult.reason instanceof Error ? catalogResult.reason.message : "request failed"}). Showing sample courses from this project; sample courses cannot be enrolled in.`);
        } else if (usingMockCourses) {
          setNotice("No live courses are published yet. Showing sample courses from this project; sample courses cannot be enrolled in.");
        } else if (enrollmentsResult.status === "rejected") {
          setNotice(`/api/enrollments/ failed: ${enrollmentsResult.reason instanceof Error ? enrollmentsResult.reason.message : "Request failed"}. Courses are shown, but enrollment status is unavailable.`);
        }
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : "Courses could not be loaded. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCourses();
    return () => { active = false; };
  }, [router]);

  const enrolledCount = courses.filter((course) => course.enrollmentStatus === "ENROLLED").length;
  const completedCount = courses.filter((course) => course.enrollmentStatus === "COMPLETED").length;
  const categories = useMemo(() => ["All subjects", ...new Set(courses.map((course) => course.subject).filter((subject): subject is string => Boolean(subject)))], [courses]);
  const filteredCourses = courses.filter((course) => {
    if (selectedStatus === "Enrolled" && course.enrollmentStatus !== "ENROLLED") return false;
    if (selectedStatus === "Completed" && course.enrollmentStatus !== "COMPLETED") return false;
    if (selectedCategory !== "All subjects" && course.subject !== selectedCategory) return false;
    return true;
  });

  async function enroll(courseId: string) {
    setEnrollingId(courseId);
    setNotice("");
    try {
      const user = await currentUser();
      const savedEnrollment = await apiJson<ApiEnrollment | null>(await enrollInCourse(courseId, String(user.id)));
      const status = enrollmentStatusLabel(savedEnrollment?.status || "active");
      setCourses((current) => current.map((course) => course.id === courseId
        ? { ...course, enrollmentStatus: status }
        : course));
      setNotice(`Course status: ${statusLabel[status] ?? status.toLowerCase()}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not enroll in this course. Please try again.");
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className="py-3">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b655a] dark:text-[#8c9c89]">Your learning space</p>
        <h1 className="mt-0.5 text-[20px] font-bold text-[#171d15] dark:text-[#f0f4ee]">My Courses</h1>
        <p className="mt-1 text-[9px] text-[#687463] dark:text-[#9aa592]">Courses and enrollment status from your Konnect account.</p>
      </header>

      {notice && <p role="status" className="mt-3 rounded border border-[#e2e7dd] bg-white px-3 py-2 text-[10px] text-[#52644a] dark:border-white/10 dark:bg-[#1b211a] dark:text-[#c5d6bc]">{notice}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter courses by enrollment status">
        {[["All courses", courses.length], ["Enrolled", enrolledCount], ["Completed", completedCount]].map(([label, count]) => {
          const value = String(label);
          return <button key={value} type="button" onClick={() => setSelectedStatus(value)} aria-pressed={selectedStatus === value} className={`rounded-md border px-2.5 py-1.5 text-[10px] font-semibold ${selectedStatus === value ? "border-[#1b2d1a] bg-[#1b2d1a] text-white dark:border-[#2f492b] dark:bg-[#253922]" : "border-[#dfe5da] bg-white text-[#3b453d] hover:bg-[#f3f6ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#c5d6bc]"}`}>{value} ({count})</button>;
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-[10px] font-medium text-[#58645b] dark:text-[#a6aea0]">Subject
          <span className="relative">
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="h-8 appearance-none rounded border border-[#dfe5da] bg-white py-1 pl-2.5 pr-7 text-[10px] text-[#3b453d] outline-none focus:border-[#526d43] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#dce7d9]">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </span>
        </label>
      </div>

      {loading ? <p className="mt-6 text-[11px] text-[#687463] dark:text-[#a6aea0]">Loading courses from your account…</p> : filteredCourses.length ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const status = course.enrollmentStatus;
            const isTaking = status === "ENROLLED" || status === "COMPLETED";
            const isPending = status === "PENDING";
            return (
              <article key={course.id} className="flex min-h-[190px] flex-col rounded-lg border border-[#dfe5da] bg-white p-3.5 dark:border-[#212f1f] dark:bg-[#141d13]">
              <div className="relative -mx-3.5 -mt-3.5 mb-3 h-28 overflow-hidden rounded-t-lg bg-[#e8eee3] dark:bg-[#263521]">
                {course.banner_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.banner_image} alt={`${course.title} course banner`} loading="lazy" className="h-full w-full object-cover" />
                ) : <div className="grid h-full place-items-center text-[#718064] dark:text-[#a8be97]"><BookOpen size={28} aria-hidden="true" /></div>}
                <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-white">{course.subject || "Course"}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded bg-[#edf4e8] text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6bc]"><BookOpen size={15} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8px] font-bold uppercase tracking-wide text-[#718064] dark:text-[#a8be97]">{course.subject || "Course"}</p>
                  <Link href={`/learner/courses/enroll?courseId=${encodeURIComponent(course.id)}`} onClick={() => { try { sessionStorage.setItem("konnect-enrollment-course", JSON.stringify({ ...course, description: course.description || "", subject: course.subject || "General", teacher_name: course.teacher_name || "Konnect instructor", banner_image: course.banner_image || null, isDemo: Boolean(course.isDemo) })); } catch {} }} className="mt-1 block text-[12px] font-semibold leading-snug text-[#1b2219] hover:underline dark:text-[#f0f4ee]">{course.title}</Link>
                </div>
                {course.isDemo ? <span className="inline-flex shrink-0 rounded-full bg-[#f4eedb] px-2 py-1 text-[8px] font-semibold text-[#78622e]">Sample</span> : status && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#edf4e8] px-2 py-1 text-[8px] font-semibold text-[#405b35] dark:bg-[#263521] dark:text-[#c5d6bc]">{status === "COMPLETED" && <Check size={10} />}{statusLabel[status] ?? status}</span>}
              </div>
              <p className="mt-3 line-clamp-3 flex-1 text-[10px] leading-relaxed text-[#58645b] dark:text-[#a6aea0]">{course.description || "No course description has been added yet."}</p>
              <p className="mt-3 text-[9px] text-[#687463] dark:text-[#9aa592]">{course.teacher_name || "Instructor not listed"}</p>
              {isTaking ? (
                <div className="mt-3 flex flex-col gap-1.5">
                  {Boolean(
                    activeLiveClass &&
                    (activeLiveClass.sessionId === course.id ||
                     activeLiveClass.classId === course.id ||
                     course.title.toLowerCase().includes((activeLiveClass.courseTitle || "").toLowerCase()) ||
                     (activeLiveClass.courseTitle || "").toLowerCase().includes(course.title.toLowerCase()))
                  ) && (
                    <Link
                      href={`/learner/live_classes/waiting-room?session=${encodeURIComponent(activeLiveClass?.sessionId || course.id)}&autoRequest=1`}
                      className="flex min-h-8 items-center justify-center gap-1.5 rounded-md bg-[#25491d] text-[9.5px] font-bold text-white shadow hover:bg-[#326127] transition animate-pulse"
                    >
                      <Video size={11} className="text-[#86efac]" />
                      <span>🔴 Live Now · Ask to Join →</span>
                    </Link>
                  )}
                  <Link
                    href="/learner/live_classes"
                    className="flex min-h-8 items-center justify-center rounded-md border border-[#dfe5da] text-[9.5px] font-semibold text-[#1b2219] hover:bg-[#f3f6ef] dark:border-[#273724] dark:text-[#dce7d9] dark:hover:bg-[#1e2e1c]"
                  >
                    View Class Schedule
                  </Link>
                </div>
              ) : isPending ? (
                <button
                  type="button"
                  disabled
                  className="mt-3 min-h-9 rounded-md border border-[#dfe5da] text-[10px] font-semibold text-[#687463] dark:border-[#273724] dark:text-[#9aa592]"
                >
                  Enrollment pending
                </button>
              ) : (
                <button
                  type="button"
                  disabled={enrollingId === course.id}
                  onClick={() => void enroll(course.id)}
                  className="mt-3 min-h-9 rounded-md bg-[#1b2d1a] text-[10px] font-semibold text-white hover:bg-[#111e10] disabled:cursor-wait disabled:opacity-60 dark:bg-[#273d23]"
                >
                  {enrollingId === course.id ? "Enrolling…" : "Take this course"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-[#d5ddce] px-4 py-10 text-center dark:border-[#303b2d]">
          <p className="text-[11px] font-semibold text-[#33412e] dark:text-[#e1e8dc]">
            {courses.length ? "No courses match these filters." : "No courses are available for your account yet."}
          </p>
          {!courses.length && (
            <p className="mt-1 text-[9px] text-[#7a8575] dark:text-[#a6aea0]">
              Courses will appear here when they are published to the API.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
