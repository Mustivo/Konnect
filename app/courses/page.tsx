
"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Level = "Beginner" | "Intermediate" | "Advanced";

interface Course {
  id: number;
  category: string;
  title: string;
  instructor: string;
  rating: number;
  level: Level;
  duration: string;
  price: string;
  image: string;
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
  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] tracking-tight text-amber-500">
        ★★★★★
      </span>

      <span className="text-[11px] text-[#6b7565]">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e6e9dc] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <img
        src={course.image}
        alt={course.title}
        className="h-44 w-full object-cover"
      />

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7565]">
            {course.category}
          </span>

          <Stars rating={course.rating} />
        </div>

        <h3 className="text-[16px] font-semibold leading-snug text-[#1f2a1c]">
          {course.title}
        </h3>

        <p className="mt-2 text-xs text-[#6b7565]">
          with {course.instructor}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#eef0e6] pt-4 text-xs">
          <span className="text-[#6b7565]">
            {course.level} · {course.duration}
          </span>

          <span className="font-semibold text-[#1f2a1c]">
            {course.price}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function CoursesPage() {
  const [filter, setFilter] = useState("All subjects");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filteredCourses = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return COURSES.filter((course) => {
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
        course.category.toLowerCase().includes(searchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [filter, query]);

  const visibleCourses = filteredCourses.slice(0, visible);

  return (
    <div className="min-h-screen bg-[#f8f9f1] text-[#1f2a1c]">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-3xl px-6 pb-10 pt-14 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7565]">
            Course catalogue
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1f2a1c] md:text-5xl">
            Learn something worth using.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6b7565]">
            Live, fun-sized courses taught by verified experts. Search by
            subject, experience, or the outcome you want next.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-lg border border-[#e0e4d4] bg-white px-4 py-3 shadow-sm">
            <span
              aria-hidden="true"
              className="text-xl leading-none text-[#9aa393]"
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
              className="w-full bg-transparent text-sm text-[#1f2a1c] outline-none placeholder:text-[#9aa393]"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-[#6b7565]">
            <span>40 live courses</span>
            <span>40 verified publishers</span>
            <span>New release every week</span>
          </div>
        </section>

        {/* FEATURED COURSE */}
        <section className="border-y border-[#eef0e6] bg-[#f3f5ea] py-10">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 md:grid-cols-2">
            <img
              src={img("konnect-featured", 1000, 700)}
              alt="Sustainable Spaces course"
              className="h-72 w-full rounded-xl object-cover shadow-md"
            />

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7565]">
                Featured · Best of Sept · Starts 14 October
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#1f2a1c]">
                Sustainable Spaces: Design for Real Life
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#5a6554]">
                Turn climate principles into thoughtful, buildable design
                choices through live studios and a personal capstone.
              </p>

              <p className="mt-4 text-xs text-[#6b7565]">
                with Amara Okafor · Architect & educator
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6b7565]">
                <Stars rating={4.8} />
                <span>Intermediate</span>
                <span>6 weeks</span>
                <span>1 project</span>
              </div>

              <button
                type="button"
                className="mt-6 rounded-md bg-[#2f4a2a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#243a20]"
              >
                View featured course
              </button>
            </div>
          </div>
        </section>

        {/* ALL COURSES */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1f2a1c]">
                Explore all courses
              </h2>

              <p className="mt-1 text-xs text-[#6b7565]">
                {filteredCourses.length} courses · showing the most relevant
              </p>
            </div>

            <button
              type="button"
              className="self-start text-xs text-[#6b7565] transition hover:text-[#2f4a2a] sm:self-auto"
            >
              Sort: Recommended ▾
            </button>
          </div>

          {/* FILTERS */}
          <div className="mt-6 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
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
                      ? "border-[#2f4a2a] bg-[#2f4a2a] text-white"
                      : "border-[#e0e4d4] bg-white text-[#3d4a38] hover:border-[#2f4a2a]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* COURSES */}
          {visibleCourses.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-[#6b7565]">
                No courses match your search yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilter("All subjects");
                  setVisible(PAGE_SIZE);
                }}
                className="mt-4 text-xs font-medium text-[#2f4a2a] underline"
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
                className="rounded-md border border-[#cfd5c0] bg-[#f3f5ea] px-5 py-2.5 text-xs font-medium text-[#3d4a38] transition hover:bg-[#e9ecdf]"
              >
                Load more courses
              </button>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-[#e6ecd8]">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 py-10 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#1f2a1c]">
                Choose one thing to learn well.
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#5a6554]">
                Pick a course that fits your pace, your goals, and your time.
              </p>
            </div>

            <button
              type="button"
              className="rounded-md border border-[#2f4a2a] px-5 py-2.5 text-sm font-medium text-[#2f4a2a] transition hover:bg-[#2f4a2a] hover:text-white"
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

