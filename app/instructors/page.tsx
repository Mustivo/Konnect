"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

type Teacher = {
  name: string;
  role: string;
  rating: string;
  students: string;
  experience: string;
  category: string;
  image: string;
};

const teachers: Teacher[] = [
  {
    name: "Maya Lin",
    role: "Product design & research",
    rating: "4.9",
    students: "120+ students",
    experience: "4+ years",
    category: "Design",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Dr. Ravi Kapoor",
    role: "Data Science & Engineering",
    rating: "4.8",
    students: "210+ students",
    experience: "6+ years",
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Sofia Alvarez",
    role: "Communication & leadership",
    rating: "4.9",
    students: "175+ students",
    experience: "5+ years",
    category: "Communication",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Anna Okafor",
    role: "Architecture & sustainability",
    rating: "4.7",
    students: "95+ students",
    experience: "5+ years",
    category: "Science",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Anika Shah",
    role: "Web development",
    rating: "4.9",
    students: "185+ students",
    experience: "4+ years",
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Theo Bennett",
    role: "Finance & business strategy",
    rating: "4.8",
    students: "135+ students",
    experience: "7+ years",
    category: "Business",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = [
  "All expertise",
  "Design",
  "Tech",
  "Business",
  "Communication",
  "Leadership",
  "Writing",
  "Science",
];

export default function InstructionsPage() {
  const [activeCategory, setActiveCategory] = useState("All expertise");
  const [search, setSearch] = useState("");

  const filteredTeachers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return teachers.filter((teacher) => {
      const matchesCategory =
        activeCategory === "All expertise" ||
        teacher.category === activeCategory;

      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.role.toLowerCase().includes(query) ||
        teacher.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">

      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= HERO ================= */}
      <section
        id="home"
        className="grid min-h-[430px] grid-cols-1 md:grid-cols-[43%_57%]"
      >
        {/* Hero text */}
        <div className="flex flex-col justify-center bg-[var(--surface-soft)] px-[7%] py-16 transition-colors duration-300 md:px-[10%]">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
            Meet your mentor
          </p>

          <h1 className="max-w-[580px] text-[42px] font-semibold leading-[1.05] tracking-[-2px] text-[var(--foreground)] sm:text-[50px] lg:text-[58px]">
            Learn from people
            <br />
            who know how to
            <br />
            teach.
          </h1>

          <p className="mt-6 max-w-[440px] text-[15px] leading-[1.7] text-[var(--muted)]">
            Every instructor combines real-world expertise with a
            relaxed, learner-first teaching practice.
          </p>
        </div>

        {/* Hero image */}
        <div className="h-[320px] overflow-hidden md:h-auto">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=90"
            alt="People learning together"
            className="h-full w-full object-cover saturate-[.8]"
          />
        </div>
      </section>

      {/* ================= TEACHERS / EXPERTISE ================= */}
      <section
        id="teachers"
        className="bg-[var(--background)] px-[5%] py-16 transition-colors duration-300 lg:py-[75px]"
      >
        <div className="mx-auto max-w-[1450px]">

          {/* Heading */}
          <div className="text-left">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
              Find your teacher
            </p>

            <h2 className="text-[36px] font-semibold tracking-[-1.5px] text-[var(--foreground)] sm:text-[42px] lg:text-[48px]">
              Expertise meets empathy.
            </h2>

            <p className="mt-4 max-w-[600px] text-[15px] leading-[1.6] text-[var(--muted)]">
              Browse by skill set and discover the right guide for
              where you&apos;re headed.
            </p>
          </div>

          {/* ================= SEARCH ================= */}
          <div className="mt-9 flex w-full items-center gap-2">

            <div className="flex h-[50px] flex-1 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 transition-colors duration-300">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 text-[var(--muted)]"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, skill or subject"
                className="w-full bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>

            <button
              type="button"
              className="h-[42px] shrink-0 rounded-md bg-[var(--button-bg)] px-5 text-[12px] font-semibold text-[var(--button-text)] transition hover:opacity-90"
            >
              Search
            </button>
          </div>

          {/* ================= FILTERS ================= */}
          <div className="my-7 flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const selected = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-[12px] font-medium transition ${
                    selected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* ================= TEACHER CARDS ================= */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <article
                key={teacher.name}
                className="group overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)] transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
              >
                {/* Image */}
                <div className="relative h-[225px] overflow-hidden">
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="h-full w-full object-cover saturate-[.85] transition duration-500 group-hover:scale-[1.04]"
                  />

                  {/* Save */}
                  <button
                    type="button"
                    aria-label={`Save ${teacher.name}`}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-[21px] text-white backdrop-blur-sm transition hover:bg-black/70"
                  >
                    ♡
                  </button>
                </div>

                {/* Information */}
                <div className="p-5">
                  <h3 className="text-[17px] font-semibold text-[var(--foreground)]">
                    {teacher.name}
                  </h3>

                  <p className="mt-2 text-[13px] text-[var(--muted)]">
                    {teacher.role}
                  </p>

                  <div className="mt-6 flex items-center justify-between text-[12px] text-[var(--muted)]">
                    <span>
                      <span className="mr-1 text-[#d6ad3d]">★</span>
                      {teacher.rating}
                    </span>

                    <span>{teacher.students}</span>

                    <span>{teacher.experience}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ================= NO RESULTS ================= */}
          {filteredTeachers.length === 0 && (
            <div className="py-24 text-center">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                No teachers found
              </h3>

              <p className="mt-3 text-[14px] text-[var(--muted)]">
                Try another name, subject, or category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className="bg-[var(--cta-background)] px-[7%] py-12 transition-colors duration-300 lg:px-[5.5%] lg:py-12"
      >
        {/* Top CTA */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

          <div>
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[2px] text-[var(--primary)]">
              TEACH ON CONNECT
            </p>

            <h2 className="max-w-[750px] text-[28px] font-semibold tracking-[-.7px] text-[var(--foreground)] sm:text-[34px]">
              Turn what you know into a class people remember.
            </h2>

            <p className="mt-4 max-w-[620px] text-[14px] leading-[1.7] text-[var(--muted)]">
              We&apos;ll help you turn your expertise, method and
              enthusiasm into a teaching practice.
            </p>
          </div>

          {/* Instructor CTA */}
          <div className="flex shrink-0 flex-col items-center">
            <a
              href="/register"
              className="flex h-[42px] w-[225px] items-center justify-center rounded-md bg-[var(--cta-button-bg)] px-6 text-center text-[13px] font-medium text-[var(--cta-button-text)] transition hover:opacity-90"
            >
              Become an instructor
            </a>

            <p className="mt-3 text-[11px] text-[var(--muted)]">
              Applications reviewed within 5 business days
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-[72px] flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[20px] font-medium text-[var(--foreground)]">
              Find the teacher who makes it click.
            </h3>

            <p className="mt-2 text-[13px] text-[var(--muted)]">
              Browse skilled mentors, learn together and keep growing.
            </p>
          </div>

          <a
            href="#teachers"
            className="flex h-[42px] w-[86px] items-center justify-center rounded-md border border-[var(--border)] text-[13px] font-medium text-[var(--foreground)] transition hover:bg-[var(--surface)]"
          >
            Get started
          </a>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        id="contact"
        className="grid gap-10 bg-[var(--background)] px-[7%] py-10 transition-colors duration-300 sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr] lg:px-[5.5%]"
      >
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <a
            href="/"
            className="font-serif text-[28px] italic tracking-[-2px] text-[var(--foreground)]"
          >
            Konnect
          </a>

          <p className="mt-5 max-w-[320px] text-[13px] leading-[1.8] text-[var(--muted)]">
            An instructor-led educational experience for curious
            people, built around expertise, empathy and better
            progression.
          </p>

          <p className="mt-8 text-[11px] text-[var(--muted)]">
            © 2026 Konnect. All rights reserved.
          </p>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">
            Platform
          </h4>

          <a
            href="/courses"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            Courses
          </a>

          <a
            href="/instructors"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            Instructors
          </a>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">
            Company
          </h4>

          <a
            href="/about"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            About
          </a>

          <a
            href="/contact"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            Contact
          </a>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">
            Legal
          </h4>

          <a
            href="/privacy"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            Privacy
          </a>

          <a
            href="/terms"
            className="text-[12px] text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            Terms
          </a>

          <span className="mt-11 text-[11px] text-[var(--muted)]">
            Deliberate Learning Retreats
          </span>
        </div>
      </footer>
    </main>
  );
}