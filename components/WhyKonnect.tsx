import { BarChart3, CircleCheck, FileText, Video } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Live classes that stay alive",
    text: "Whiteboards, slide sharing, and quick check-ins keep every learner engaged.",
  },
  {
    icon: CircleCheck,
    title: "Attendance that counts",
    text: "Automatic attendance for every session, visible to teacher and learner.",
  },
  {
    icon: FileText,
    title: "Fair, focused exams",
    text: "Full-screen exam mode flags tab-switching, so results mean something.",
  },
  {
    icon: BarChart3,
    title: "Progress you can see",
    text: "Grades, feedback, and attendance in one clear dashboard.",
  },
];

export default function WhyKonnect() {
  return (
    <section className="bg-transparent px-5 py-20">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-center text-4xl font-medium tracking-[-0.05em] text-[#1b241c] md:text-5xl lg:text-6xl dark:text-[#f4f4f0]">
          Why Konnect.
        </h2>
        <p className="mx-auto mt-6 max-w-[850px] text-center text-base text-[#4f594f] md:text-lg dark:text-[#aeb8aa]">
          Thoughtfully crafted primitives designed to make digital education
          tangible, accountable, and rewarding.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[18px] border border-[#dde7d6] bg-[#f8f7f5] p-6 text-left shadow-[0_18px_40px_rgba(0,0,0,0.06)] transition-colors dark:border-white/10 dark:bg-[#181d18] dark:shadow-black/20"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dfead5] text-[#213921]">
                <Icon size={18} />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-[#0f1711] dark:text-[#f4f4f0]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#49544d] dark:text-[#aeb8aa]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
