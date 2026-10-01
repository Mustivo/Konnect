const steps = [
  {
    title: "Sign up as a learner or teacher.",
    text: "Create your tailored profile in less than 2 minutes.",
  },
  {
    title: "Join or create a class.",
    text: "Find topics you love or launch your own interactive syllabus.",
  },
  {
    title: "Learn, teach, and grow.",
    text: "Collaborate with high-impact tools, live feedback, and real metrics.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-transparent px-5 py-20">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-center text-4xl font-medium tracking-[-0.05em] text-[#1b241c] md:text-5xl lg:text-7xl dark:text-[#f4f4f0]">
          How it works.
        </h2>
        <p className="mx-auto mt-7 max-w-[760px] text-center text-base text-[#4d564e] md:text-lg dark:text-[#aeb8aa]">
          A seamless flow designed to get you studying or lecturing without
          tedious friction.
        </p>

        <ol className="mt-14 grid gap-5 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-[18px] border border-[#dde7d6] bg-[#f8f7f5] p-6 text-left shadow-[0_18px_40px_rgba(0,0,0,0.06)] transition-colors dark:border-white/10 dark:bg-[#181d18] dark:shadow-black/20"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#273b22] text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-[#0f1711] dark:text-[#f4f4f0]">{s.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#49544d] dark:text-[#aeb8aa]">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
