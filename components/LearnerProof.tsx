import Link from "next/link";

export default function LearnerProof() {
  return (
    <>
      <section className="bg-[#f5f3ed] px-5 py-20 text-[#1b241c] dark:bg-[#151a16] dark:text-[#f4f4f0] lg:px-12">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 lg:grid-cols-[0.65fr_1.35fr]">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#536b3c] dark:text-[#9ab978]">
              Learner proof
            </p>
            <p className="mt-4 text-6xl font-semibold tracking-[-0.08em] md:text-7xl">92%</p>
            <p className="mt-3 max-w-[190px] text-sm leading-5 text-[#5b665a] dark:text-[#aeb8aa]">
              of learners finish the course they start, nearly twice the online-learning average.
            </p>
          </div>
          <figure>
            <blockquote className="text-2xl font-semibold leading-tight tracking-[-0.04em] md:text-4xl">
              “I came for the portfolio project. I stayed because my teacher knew my name, noticed when I was stuck, and helped me find a clearer way through.”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 text-xs text-[#667066] dark:text-[#aeb8aa]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dce8d3] font-bold text-[#405534] dark:bg-[#304728] dark:text-[#d9e8cf]">NP</span>
              <span><strong className="block text-[#1b241c] dark:text-[#f4f4f0]">Nia Patel</strong>Product designer · London</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-[#e8f0e0] px-5 py-8 text-[#1b241c] dark:bg-[#263b22] dark:text-[#f4f4f0] lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">A better class is one click away.</h2>
            <p className="mt-1 text-xs text-[#596856] dark:text-[#c5d6bc]">Join a course led by an educator who cares how you learn.</p>
          </div>
          <Link href="/signup" className="rounded border border-[#7c9270] px-5 py-2.5 text-xs font-semibold transition hover:bg-white/50 dark:border-[#b9d0ae] dark:hover:bg-white/10">
            Get started
          </Link>
        </div>
      </section>
    </>
  );
}
