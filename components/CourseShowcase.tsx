import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

const courses = [
  {
    category: "DESIGN",
    title: "Designing Clearer Digital Products",
    teacher: "Maya Lin",
    level: "Intermediate",
    length: "8 weeks",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "DATA",
    title: "Data Stories That Move People",
    teacher: "Ravi Kapoor",
    level: "Beginner",
    length: "4 weeks",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
  },
  {
    category: "COMMUNICATION",
    title: "Speak With Calm Confidence",
    teacher: "Sofia Alvarez",
    level: "All levels",
    length: "6 weeks",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = [
  { label: "Popular now", href: "/courses" },
  { label: "Creative practice", href: "/courses?category=creative-practice" },
  { label: "Business", href: "/courses?category=business" },
  { label: "Technology", href: "/courses?category=technology" },
  { label: "Wellbeing", href: "/courses?category=wellbeing" },
];

export default function CourseShowcase() {
  return (
    <section className="bg-[#f6f5ef] px-5 py-20 text-[#1b241c] transition-colors dark:bg-[#0d100e] dark:text-[#f4f4f0] lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <p className="text-center text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#536b3c] dark:text-[#9ab978]">
          Start somewhere exciting
        </p>
        <h2 className="mx-auto mt-4 max-w-[680px] text-center text-4xl font-semibold leading-[1.04] tracking-[-0.05em] md:text-5xl">
          A course for the next version of you.
        </h2>
        <p className="mx-auto mt-5 max-w-[660px] text-center text-sm leading-6 text-[#5b665a] dark:text-[#aeb8aa]">
          Join a small live cohort, learn with purpose, and leave with work you
          are proud to share.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-[#6a7469] dark:text-[#aeb8aa]">
          {categories.map((category, index) => (
            <Link
              key={category.label}
              href={category.href}
              className={index === 0 ? "font-bold text-[#4e6638] transition hover:text-[#263b20] dark:text-[#a4c17e] dark:hover:text-white" : "transition hover:text-[#263b20] dark:hover:text-white"}
            >
              {category.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.title}
              className="overflow-hidden rounded-lg border border-[#e0e4da] bg-[#fffefa] shadow-[0_12px_26px_rgba(24,35,20,0.08)] transition hover:-translate-y-1 dark:border-white/10 dark:bg-[#171c18] dark:shadow-black/20"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={course.image} alt="" className="h-44 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#66814a]">
                  <span>{course.category}</span>
                  <span className="inline-flex items-center gap-1 normal-case tracking-normal text-[#b98627]">
                    <Star size={11} fill="currentColor" /> {course.rating}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-tight text-[#1b241c] dark:text-[#f4f4f0]">
                  {course.title}
                </h3>
                <p className="mt-2 text-xs text-[#667066] dark:text-[#aeb8aa]">
                  with {course.teacher}
                </p>
                <div className="mt-5 flex justify-between border-t border-[#e4e8df] pt-3 text-[0.68rem] text-[#6d766d] dark:border-white/10 dark:text-[#aeb8aa]">
                  <span>{course.level} · {course.length}</span>
                  <span className="font-bold text-[#1b241c] dark:text-[#f4f4f0]">Included</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded border border-[#9eac92] px-5 py-2.5 text-xs font-semibold text-[#405534] transition hover:bg-[#e6eddf] dark:border-[#718662] dark:text-[#d7e6cb] dark:hover:bg-[#263524]"
          >
            Browse all courses <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
