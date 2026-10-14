import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Instructors", href: "/instructors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#fffdf9] px-3 pb-12 pt-10 text-[#1b241c] shadow-[inset_0_1px_0_rgba(72,88,69,0.08)] sm:px-4 lg:px-6 dark:bg-[#0d100d] dark:text-[#f4f4f0]">
      <div className="grid w-full gap-10 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-medium tracking-[-0.06em] text-[#1b241c] dark:text-[#f4f4f0]" style={{ fontFamily: "var(--font-script)" }}>
            <img
                src="/konnect-wordmark.png"
                alt="Konnect"
                className="h-10 w-auto dark:brightness-0 dark:invert"
              />
          </p>
          <p className="mt-4 max-w-[340px] text-sm leading-6 text-[#485648] dark:text-[#aeb8aa]">
            An enlightened educational atmosphere designed for deliberate
            learning, academic exploration, and friction-free intellectual
            progression.
          </p>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1b241c] dark:text-[#f4f4f0]">{c.title}</h4>
            {c.links.map((l) => (
              <Link key={l.href} href={l.href} className="block text-sm text-[#485648] transition hover:text-[#1b241c] dark:text-[#aeb8aa] dark:hover:text-[#f4f4f0]">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="mt-10 flex w-full flex-col justify-between gap-3 border-t border-[#e3e4d8] pt-6 text-xs text-[#526051] md:flex-row dark:border-white/10 dark:text-[#aeb8aa]">
        <span>© 2026 Konnect Inc. All rights reserved.</span>
        <span>Deliberate Learning Retreats</span>
      </div>
    </footer>
  );
}
