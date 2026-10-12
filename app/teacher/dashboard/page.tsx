import Link from "next/link";
import { BookOpen, CalendarDays, CircleUserRound, Plus } from "lucide-react";

const actions = [
  { title: "Create a class", description: "Set up a new live class.", icon: Plus },
  { title: "Manage schedule", description: "Review your upcoming availability.", icon: CalendarDays },
  { title: "Edit your profile", description: "Update your public instructor profile.", icon: CircleUserRound },
];

export default function TeacherDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f6f0] px-5 py-10 text-[#1b241c]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[#263d21]">
          Konnect
        </Link>

        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60764f]">
            Teacher portal
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome to your dashboard.
          </h1>
          <p className="mt-2 text-sm text-[#687267]">
            Manage your classes, schedule, and instructor profile from here.
          </p>
        </div>

        <section className="mt-8 rounded-lg border border-[#dfe5d8] bg-[#fffefa] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8efe2] text-[#456238]">
              <BookOpen size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Your teaching workspace is ready</h2>
              <p className="mt-1 text-xs text-[#687267]">
                Start by creating a class or completing your instructor profile.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {actions.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-lg border border-[#dfe5d8] bg-[#fffefa] p-5">
              <Icon size={18} className="text-[#526d43]" />
              <h2 className="mt-4 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-[#687267]">{description}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
