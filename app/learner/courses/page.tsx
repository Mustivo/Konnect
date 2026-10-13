"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Code2,
  Sparkles,
  Terminal,
  Lock,
  Palette,
  Lightbulb,
  Cpu,
  ChevronDown,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  codeTag: string;
  badge: string;
  badgeBg: string;
  iconType: "react" | "uiux" | "django" | "math" | "security" | "design" | "softskills" | "ml";
  iconBg: string;
  iconColor: string;
  codeColor: string;
  instructor: string;
  lessons: number;
  level: string;
  levelBg: string;
  levelColor: string;
  enrolled: boolean;
  progress?: number;
  progressColor?: string;
  progressTextColor?: string;
  image: string;
}

const allCourses: Course[] = [
  // ENROLLED COURSES
  {
    id: "react",
    title: "React.js — Modern Frontend Development",
    subtitle: "Build dynamic UIs with hooks, state management & React Router. Industry-standard frontend skills.",
    category: "Development",
    codeTag: "REACT.JS · WEB DEV",
    badge: "WEB DEV",
    badgeBg: "bg-[#0ea5e9]",
    iconType: "react",
    iconBg: "bg-[#f3e8ff] dark:bg-[#281b36]",
    iconColor: "text-[#9333ea] dark:text-[#c084fc]",
    codeColor: "text-[#0284c7] dark:text-[#38bdf8]",
    instructor: "Sarah Mitchell",
    lessons: 14,
    level: "Intermediate",
    levelBg: "bg-[#f1f5f9] dark:bg-[#1a242f]",
    levelColor: "text-[#475569] dark:text-[#94a3b8]",
    enrolled: true,
    progress: 67,
    progressColor: "bg-[#0284c7]",
    progressTextColor: "text-[#0284c7] dark:text-[#38bdf8]",
    image: "/courses/react.jpg",
  },
  {
    id: "uiux",
    title: "UI/UX Design — Wireframes to Prototypes",
    subtitle: "Master Figma, user research, design systems & usability testing from scratch.",
    category: "Design",
    codeTag: "UI/UX DESIGN · DESIGN",
    badge: "DESIGN",
    badgeBg: "bg-[#7c3aed]",
    iconType: "uiux",
    iconBg: "bg-[#f5f3ff] dark:bg-[#261839]",
    iconColor: "text-[#7c3aed] dark:text-[#a855f7]",
    codeColor: "text-[#7c3aed] dark:text-[#a855f7]",
    instructor: "Amara Okafor",
    lessons: 12,
    level: "Beginner",
    levelBg: "bg-[#fdf2f8] dark:bg-[#2d1727]",
    levelColor: "text-[#db2777] dark:text-[#f472b6]",
    enrolled: true,
    progress: 58,
    progressColor: "bg-[#7c3aed]",
    progressTextColor: "text-[#7c3aed] dark:text-[#c084fc]",
    image: "/courses/uiux-design.jpg",
  },
  {
    id: "django",
    title: "Django — Full-Stack Web Applications",
    subtitle: "Build REST APIs, MVC architecture, authentication & deploy production-ready apps.",
    category: "Development",
    codeTag: "DJANGO · BACKEND DEV",
    badge: "BACKEND DEV",
    badgeBg: "bg-[#15803d]",
    iconType: "django",
    iconBg: "bg-[#f0fdf4] dark:bg-[#15291b]",
    iconColor: "text-[#16a34a] dark:text-[#4ade80]",
    codeColor: "text-[#16a34a] dark:text-[#4ade80]",
    instructor: "Daniel Brooks",
    lessons: 16,
    level: "Intermediate",
    levelBg: "bg-[#f0fdf4] dark:bg-[#15291b]",
    levelColor: "text-[#16a34a] dark:text-[#4ade80]",
    enrolled: true,
    progress: 34,
    progressColor: "bg-[#16a34a]",
    progressTextColor: "text-[#16a34a] dark:text-[#4ade80]",
    image: "/courses/django.jpg",
  },
  {
    id: "math",
    title: "Mathematics for Everyday Life",
    subtitle: "Linear functions, probability, statistics & applied problem solving in real-world contexts.",
    category: "Mathematics",
    codeTag: "MATHEMATICS · MTH 201",
    badge: "MATHEMATICS",
    badgeBg: "bg-[#ea580c]",
    iconType: "math",
    iconBg: "bg-[#fff7ed] dark:bg-[#2d1c15]",
    iconColor: "text-[#ea580c] dark:text-[#fb923c]",
    codeColor: "text-[#ea580c] dark:text-[#fb923c]",
    instructor: "Dr. Elena Ruiz",
    lessons: 12,
    level: "Beginner",
    levelBg: "bg-[#fff7ed] dark:bg-[#2d1c15]",
    levelColor: "text-[#ea580c] dark:text-[#fb923c]",
    enrolled: true,
    progress: 75,
    progressColor: "bg-[#ea580c]",
    progressTextColor: "text-[#ea580c] dark:text-[#fb923c]",
    image: "/courses/mathematics.jpg",
  },

  // AVAILABLE / UNENROLLED COURSES
  {
    id: "security",
    title: "Cybersecurity Fundamentals",
    subtitle: "Network security, ethical hacking basics, threat analysis & modern defence strategies.",
    category: "Security",
    codeTag: "CYBERSECURITY · SEC 301",
    badge: "SECURITY",
    badgeBg: "bg-[#0d1726]",
    iconType: "security",
    iconBg: "bg-[#e0f2fe] dark:bg-[#162737]",
    iconColor: "text-[#0284c7] dark:text-[#38bdf8]",
    codeColor: "text-[#0284c7] dark:text-[#38bdf8]",
    instructor: "Marcus Adeyemi",
    lessons: 10,
    level: "Intermediate",
    levelBg: "bg-[#e0f2fe] dark:bg-[#162737]",
    levelColor: "text-[#0284c7] dark:text-[#38bdf8]",
    enrolled: false,
    image: "/courses/cybersecurity.jpg",
  },
  {
    id: "design",
    title: "Graphic Design — Visual Storytelling",
    subtitle: "Typography, colour theory, brand identity & Adobe Illustrator for modern graphic designers.",
    category: "Design",
    codeTag: "GRAPHIC DESIGN · GD 201",
    badge: "DESIGN",
    badgeBg: "bg-[#db2777]",
    iconType: "design",
    iconBg: "bg-[#fce7f3] dark:bg-[#2e1728]",
    iconColor: "text-[#db2777] dark:text-[#f472b6]",
    codeColor: "text-[#db2777] dark:text-[#f472b6]",
    instructor: "Nadia Fernandez",
    lessons: 10,
    level: "Beginner",
    levelBg: "bg-[#fce7f3] dark:bg-[#2e1728]",
    levelColor: "text-[#db2777] dark:text-[#f472b6]",
    enrolled: false,
    image: "/courses/graphic-design.jpg",
  },
  {
    id: "softskills",
    title: "Soft Skills for the Digital Age",
    subtitle: "Communication, leadership, critical thinking & emotional intelligence for modern professionals.",
    category: "Personal Growth",
    codeTag: "SOFT SKILLS · SS 101",
    badge: "PERSONAL GROWTH",
    badgeBg: "bg-[#d97706]",
    iconType: "softskills",
    iconBg: "bg-[#fef3c7] dark:bg-[#2d2212]",
    iconColor: "text-[#d97706] dark:text-[#fbbf24]",
    codeColor: "text-[#d97706] dark:text-[#fbbf24]",
    instructor: "Prof. James Osei",
    lessons: 8,
    level: "All Levels",
    levelBg: "bg-[#fef3c7] dark:bg-[#2d2212]",
    levelColor: "text-[#b45309] dark:text-[#fbbf24]",
    enrolled: false,
    image: "/courses/soft-skills.jpg",
  },
  {
    id: "ml",
    title: "Machine Learning — Foundations & Practice",
    subtitle: "Supervised & unsupervised learning, model evaluation, Python scikit-learn & real datasets.",
    category: "Data & AI",
    codeTag: "MACHINE LEARNING · ML 401",
    badge: "DATA & AI",
    badgeBg: "bg-[#4338ca]",
    iconType: "ml",
    iconBg: "bg-[#ede9fe] dark:bg-[#201d3a]",
    iconColor: "text-[#4f46e5] dark:text-[#818cf8]",
    codeColor: "text-[#4f46e5] dark:text-[#818cf8]",
    instructor: "Dr. Priya Nair",
    lessons: 14,
    level: "Advanced",
    levelBg: "bg-[#ede9fe] dark:bg-[#201d3a]",
    levelColor: "text-[#6d28d9] dark:text-[#818cf8]",
    enrolled: false,
    image: "/courses/machine-learning.jpg",
  },
];

const statusTabs = ["All Courses", "Enrolled · 4", "Completed · 0"];
const categories = [
  "All Categories",
  "Development",
  "Design",
  "Security",
  "Data & AI",
  "Personal Growth",
  "Mathematics",
];

export default function LearnerCoursesPage() {
  const [selectedStatus, setSelectedStatus] = useState("All Courses");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const filteredCourses = allCourses.filter((course) => {
    if (selectedStatus === "Enrolled · 4" && !course.enrolled) return false;
    if (selectedStatus === "Completed · 0") return false;

    if (selectedCategory !== "All Categories" && course.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const renderIcon = (type: Course["iconType"]) => {
    switch (type) {
      case "react":
        return <Code2 size={11} />;
      case "uiux":
        return <Sparkles size={11} />;
      case "django":
        return <Terminal size={11} />;
      case "math":
        return <span className="font-bold text-[10px] leading-none">Σ</span>;
      case "security":
        return <Lock size={11} />;
      case "design":
        return <Palette size={11} />;
      case "softskills":
        return <Lightbulb size={11} />;
      case "ml":
        return <Cpu size={11} />;
    }
  };

  return (
    <div className="learner-courses-page py-3">
      {/* Title */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b655a] dark:text-[#8c9c89]">
          YOUR LEARNING SPACE
        </p>

        <h1 className="mt-0.5 text-[20px] font-bold text-[#171d15] dark:text-[#f0f4ee]">
          My Courses
        </h1>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatus(tab)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                isActive
                  ? "border-[#1b2d1a] bg-[#1b2d1a] text-white dark:border-[#2f492b] dark:bg-[#253922] dark:text-[#b4e3a8] shadow-sm"
                  : "border-[#dfe5da] bg-white text-[#3b453d] hover:bg-[#f3f6ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#8c9c89] dark:hover:bg-[#1b2819]"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
                isActive
                  ? "border-[#1b2d1a] bg-[#1b2d1a] text-white dark:border-[#2f492b] dark:bg-[#253922] dark:text-[#b4e3a8] shadow-sm"
                  : "border-[#dfe5da] bg-[#f4f6f0] text-[#4e5a51] hover:bg-white dark:border-[#212f1f] dark:bg-[#152014] dark:text-[#849480] dark:hover:bg-[#1d2b1c]"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Dropdown filters */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#58645b] dark:text-[#849480]">
        <span className="mr-1 text-[11px] font-medium text-[#58645b] dark:text-[#849480]">
          Filter by:
        </span>

        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-[#dfe5da] bg-white px-2 py-0.5 text-[10px] font-medium text-[#3b453d] hover:bg-[#f3f6ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#8c9c89] dark:hover:bg-[#1b2819]"
        >
          <span>Level</span>
          <ChevronDown size={11} className="text-[#58645b] dark:text-[#849480]" />
        </button>

        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-[#dfe5da] bg-white px-2 py-0.5 text-[10px] font-medium text-[#3b453d] hover:bg-[#f3f6ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#8c9c89] dark:hover:bg-[#1b2819]"
        >
          <span>Duration</span>
          <ChevronDown size={11} className="text-[#58645b] dark:text-[#849480]" />
        </button>

        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-[#dfe5da] bg-white px-2 py-0.5 text-[10px] font-medium text-[#3b453d] hover:bg-[#f3f6ef] dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#8c9c89] dark:hover:bg-[#1b2819]"
        >
          <span>Sort: Popular</span>
          <ChevronDown size={11} className="text-[#58645b] dark:text-[#849480]" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3 CARDS PER ROW GRID (lg:grid-cols-3)                     */}
      {/* ========================================================= */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filteredCourses.map((course) => (
          <article
            key={course.id}
            className="flex flex-col justify-between overflow-hidden rounded-lg border border-[#dfe5da] bg-white shadow-[0_2px_10px_rgba(26,36,25,0.03)] dark:border-[#212f1f] dark:bg-[#141d13] dark:shadow-none transition-all hover:shadow-md"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-[64px] w-full overflow-hidden bg-slate-900">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />

                {/* Top left badge */}
                <span
                  className={`absolute left-2.5 top-2.5 rounded-full ${course.badgeBg} px-2.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white shadow-sm`}
                >
                  {course.badge}
                </span>

                {/* Top right enrolled badge */}
                {course.enrolled && (
                  <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#22c55e] px-2 py-0.5 text-[8.5px] font-bold text-white shadow-sm">
                    <Check size={10} strokeWidth={3} />
                    <span>Enrolled</span>
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="space-y-2 p-2.5 pb-3">
                {/* Code Tag & Icon */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded ${course.iconBg} ${course.iconColor}`}
                  >
                    {renderIcon(course.iconType)}
                  </span>
                  <span className={`text-[9.5px] font-bold tracking-wider ${course.codeColor}`}>
                    {course.codeTag}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-[12px] font-semibold leading-snug text-[#1b2219] dark:text-[#f0f4ee]">
                  {course.title}
                </h2>

                {/* Subtitle */}
                <p className="line-clamp-2 text-[10px] leading-[1.4] text-[#58645b] dark:text-[#91a08e]">
                  {course.subtitle}
                </p>

                {/* Instructor & Lessons */}
                <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px] text-[#566257] dark:text-[#889885]">
                  <span>{course.instructor}</span>
                  <span>{course.lessons} lessons</span>
                </div>

                {/* Level & Progress */}
                {course.enrolled && course.progress !== undefined ? (
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${course.levelBg} ${course.levelColor}`}
                      >
                        {course.level}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${course.progressTextColor || "text-[#61705c]"}`}
                      >
                        {course.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#edf1ea] dark:bg-[#1e2d1d]">
                      <div
                        className={`h-full rounded-full ${course.progressColor || "bg-[#3a5a39]"}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${course.levelBg} ${course.levelColor}`}
                    >
                      {course.level}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-2.5 pt-0">
              {course.enrolled ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-[#dfe5da] bg-white py-1.5 text-[10px] font-medium text-[#1b2219] transition hover:border-[#1b2d1a] hover:bg-[#f3f6ef] dark:border-[#273724] dark:bg-[#182317] dark:text-[#dce7d9] dark:hover:bg-[#1e2e1c]"
                >
                  <span>View course</span>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1b2d1a] py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#111e10] dark:bg-[#273d23] dark:hover:bg-[#304d2b]"
                >
                  <span>Enroll course</span>
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
