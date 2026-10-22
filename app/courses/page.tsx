"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCourseCatalog, type CourseCatalogItem } from "@/lib/courses/catalog";

type Level = "Beginner" | "Intermediate" | "Advanced";

interface Course {
  id: string | number;
  category: string;
  title: string;
  instructor: string;
  rating: number;
  level: string;
  duration: string;
  price: string;
  image: string;
  description?: string;
  isDemo?: boolean;
}

const img = (
  seed: string,
  width = 800,
  height = 560
): string => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
};

const COURSES: Course[] = [
  {
    id: 1,
    category: "Design",
    title: "Designing Clearer Digital Products",
    instructor: "Amara Okafor",
    rating: 4.8,
    level: "Intermediate",
    duration: "5 weeks",
    price: "$84",
    image: img("konnect-design"),
  },
  {
    id: 2,
    category: "Data",
    title: "Data Stories That Move People",
    instructor: "Eli Rosenberg",
    rating: 4.7,
    level: "Beginner",
    duration: "4 weeks",
    price: "Included",
    image: img("konnect-data"),
  },
  {
    id: 3,
    category: "Communication",
    title: "Speak With Calm Confidence",
    instructor: "Dalia Kamanzi",
    rating: 4.9,
    level: "Intermediate",
    duration: "6 weeks",
    price: "$42",
    image: img("konnect-speak"),
  },
  {
    id: 4,
    category: "Science",
    title: "The Practical Climate Toolkit",
    instructor: "Noah Whitmore",
    rating: 4.6,
    level: "Beginner",
    duration: "3 weeks",
    price: "$18",
    image: img("konnect-climate"),
  },
  {
    id: 5,
    category: "Technology",
    title: "Build Your First Web App",
    instructor: "Grace Uwase",
    rating: 4.8,
    level: "Beginner",
    duration: "8 weeks",
    price: "$79",
    image: img("konnect-webapp"),
  },
  {
    id: 6,
    category: "Writing",
    title: "Writing a Short Story That Lands",
    instructor: "Imani Brooks",
    rating: 4.7,
    level: "Intermediate",
    duration: "4 weeks",
    price: "Included",
    image: img("konnect-story"),
  },
  {
    id: 7,
    category: "Business",
    title: "Run Meetings People Respect",
    instructor: "Luca Moretti",
    rating: 4.5,
    level: "Advanced",
    duration: "3 weeks",
    price: "$36",
    image: img("konnect-business"),
  },
  {
    id: 8,
    category: "Technology",
    title: "TypeScript for Real Projects",
    instructor: "Ishimwe Claude",
    rating: 4.9,
    level: "Advanced",
    duration: "6 weeks",
    price: "$95",
    image: img("konnect-typescript"),
  },
  {
    id: 9,
    category: "Design",
    title: "Color and Type Fundamentals",
    instructor: "Sofia Alvarez",
    rating: 4.6,
    level: "Beginner",
    duration: "2 weeks",
    price: "$24",
    image: img("konnect-typography"),
  },
];

const FILTERS = [
  "All subjects",
  "Design",
  "Technology",
  "Business",
  "Writing",
  "Science",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const LEVELS: Level[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const PAGE_SIZE = 6;

function Stars({ rating }: { rating: number }) {
  if (rating <= 0) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] tracking-tight text-amber-500">
        ★★★★★
      </span>

      <span className="text-[11px] text-[var(--muted)]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function CourseCard({ course, onEnroll }: { course: Course; onEnroll: (course: Course) => void }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <img
        src={course.image}
        alt={course.title}
        className="h-44 w-full object-cover"
      />

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            {course.category}
          </span>

          <Stars rating={course.rating} />
        </div>

        <h3 className="text-[16px] font-semibold leading-snug text-[var(--foreground)]">
          {course.title}
        </h3>

        {course.description && <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-xs leading-5 text-[var(--muted)]">{course.description}</p>}

        <p className="mt-2 text-xs text-[var(--muted)]">
          with {course.instructor}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs">
          <span className="text-[var(--muted)]">
            {course.level} · {course.duration}
          </span>

          <button type="button" onClick={() => onEnroll(course)} className="rounded-md bg-[#2f4a2a] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#243a20]">
            Enroll in course
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [filter, setFilter] = useState("All subjects");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;
    void getCourseCatalog().then((catalog) => {
      if (!active) return;
      setCourses(catalog.map((course) => ({
        id: course.id,
        category: course.subject,
        title: course.title,
        instructor: course.teacher_name,
        rating: 0,
        level: course.level || "Course",
        duration: course.lessons ? `${course.lessons} lessons` : "Self-paced",
        price: course.isDemo ? "Sample course" : "Enroll to join",
        image: course.banner_image || "/courses/mathematics.jpg",
        description: course.description,
        isDemo: course.isDemo,
      })));
    }).finally(() => {
      if (active) setLoadingCourses(false);
    });
    return () => { active = false; };
  }, []);

  const filters = useMemo(() => [
    "All subjects",
    ...new Set(courses.map((course) => course.category)),
    ...LEVELS,
  ], [courses]);

  function continueEnrollment(course: Course) {
    const courseId = String(course.id);
    const courseSummary: CourseCatalogItem = {
      id: courseId,
      title: course.title,
      description: course.description || "Course details coming soon.",
      subject: course.category,
      teacher_name: course.instructor,
      banner_image: course.image,
      isDemo: Boolean(course.isDemo),
      level: course.level,
    };
    try {
      sessionStorage.setItem("konnect-enrollment-course", JSON.stringify(courseSummary));
    } catch {}
    const enrollmentPath = `/learner/courses/enroll?courseId=${encodeURIComponent(courseId)}`;
    if (window.localStorage.getItem("konnect-access-token")) {
      router.push(enrollmentPath);
    } else {
      router.push(`/login?courseId=${encodeURIComponent(courseId)}`);
    }
  }

  const filteredCourses = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return courses.filter((course) => {
      let matchesFilter = true;

      if (filter !== "All subjects") {
        if (LEVELS.includes(filter as Level)) {
          matchesFilter = course.level === filter;
        } else {
          matchesFilter = course.category === filter;
        }
      }

      const matchesSearch =
        searchTerm.length === 0 ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm) ||
        course.category.toLowerCase().includes(searchTerm) ||
        course.description?.toLowerCase().includes(searchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [courses, filter, query]);

  const visibleCourses = filteredCourses.slice(0, visible);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-14 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Course catalogue
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl">
            Learn something worth using.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Live, fun-sized courses taught by verified experts. Search by
            subject, experience, or the outcome you want next.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
            <span
              aria-hidden="true"
              className="text-xl leading-none text-[var(--muted)]"
            >
              ⌕
            </span>

            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search courses, skills or instructors"
              aria-label="Search courses"
              className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-[var(--muted)]">
            <span>{loadingCourses ? "Loading courses…" : `${courses.length} courses available`}</span>
            <span>Courses taught by verified educators</span>
            <span>Learn at your own pace</span>
          </div>
        </section>

        {/* FEATURED COURSE */}
        {courses[0] && <section className="border-y border-[var(--border)] bg-[var(--surface-soft)] py-10 transition-colors duration-300">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2">
            <img
              src={courses[0].image}
              alt={courses[0].title}
              className="h-72 w-full rounded-xl object-cover shadow-md"
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Featured course · {courses[0].category}
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight text-[var(--foreground)]">
                {courses[0].title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {courses[0].description}
              </p>

              <p className="mt-4 text-xs text-[var(--muted)]">
                with {courses[0].instructor}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                <span>{courses[0].level}</span>
                <span>{courses[0].duration}</span>
              </div>

              <button
                type="button"
                onClick={() => continueEnrollment(courses[0])}
                className="mt-6 rounded-md bg-[#2f4a2a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#243a20] dark:bg-[#879b5c] dark:text-[#0b0d0b] dark:hover:bg-[#9aad6e]"
              >
                Enroll in this course
              </button>
            </div>
          </div>
        </section>}

        {/* ALL COURSES */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Explore all courses
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {filteredCourses.length} courses · showing the most relevant
              </p>
            </div>

            <button
              type="button"
              className="self-start text-xs text-[var(--muted)] transition hover:text-[var(--primary)] sm:self-auto"
            >
              Sort: Recommended ▾
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-6 flex flex-wrap gap-2">
              {filters.map((item) => {
              const isActive = filter === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setFilter(item);
                    setVisible(PAGE_SIZE);
                  }}
                  className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                    isActive
                      ? "border-[#2f4a2a] bg-[#2f4a2a] text-white dark:border-[#879b5c] dark:bg-[#879b5c] dark:text-[#0b0d0b]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* COURSES */}
          {loadingCourses ? (
            <p className="py-16 text-center text-sm text-[var(--muted)]">Loading courses from the learner catalogue…</p>
          ) : visibleCourses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-[var(--muted)]">
                No courses match your search yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("All subjects");
                  setVisible(PAGE_SIZE);
                }}
                className="mt-4 text-xs font-medium text-[var(--primary)] underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={continueEnrollment}
                />
              ))}
            </div>
          )}

          {/* LOAD MORE */}
          {visible < filteredCourses.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => {
                  setVisible((current) => current + PAGE_SIZE);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-2.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]"
              >
                Load more courses
              </button>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-[var(--surface-soft)] transition-colors duration-300">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 py-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Choose one thing to learn well.
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                Pick a course that fits your pace, your goals, and your time.
              </p>
            </div>

            <button
              type="button"
              className="rounded-md border border-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
            >
              Get started
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
