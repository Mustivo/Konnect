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
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <strong>Konnect</strong>
          <p>
            An enlightened educational atmosphere designed for deliberate
            learning, academic exploration, and friction-free intellectual
            progression.
          </p>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="footer__col">
            <h4>{c.title}</h4>
            {c.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="footer__bottom">
        <span>© 2026 Konnect Inc. All rights reserved.</span>
        <span>Deliberate Learning Retreats</span>
      </div>
    </footer>
  );
}
