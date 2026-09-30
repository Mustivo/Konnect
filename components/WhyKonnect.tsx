import { BarChart3, CircleCheck, FileText, Video } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live classes that stay alive",
    text: "Whiteboards, slide sharing, and quick check-ins keep every learner engaged.",
    cls: "f1",
  },
  {
    icon: CircleCheck,
    title: "Attendance that counts",
    text: "Automatic attendance for every session, visible to teacher and learner.",
    cls: "f2",
  },
  {
    icon: FileText,
    title: "Fair, focused exams",
    text: "Full-screen exam mode flags tab-switching, so results mean something.",
    cls: "f3",
  },
  {
    icon: BarChart3,
    title: "Progress you can see",
    text: "Grades, feedback, and attendance in one clear dashboard.",
    cls: "f4",
  },
];

export default function WhyKonnect() {
  return (
    <section className="section why">
      <h2>Why Konnect.</h2>
      <p className="lead lead--muted">
        Thoughtfully crafted primitives designed to make digital education
        tangible, accountable, and rewarding.
      </p>

      <div className="features">
        {features.map(({ icon: Icon, title, text, cls }) => (
          <article key={title} className={`card feature ${cls}`}>
            <span className="icon-tile">
              <Icon size={16} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
