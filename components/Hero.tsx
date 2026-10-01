import Link from "next/link";
import { Star } from "lucide-react";

const avatars = ["ML", "RK", "SA"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(108deg,#f7f6ef_0%,#f2f3e9_55%,#566746_100%)] dark:bg-[linear-gradient(108deg,#070b05_0%,#111b0c_55%,#35451d_100%)]">
      <div className="mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-2">
        <div className="relative z-10 max-w-[600px] pt-4 lg:pt-8">
          <p className="mb-5 flex items-center justify-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-[#536b3c] lg:justify-start dark:text-[#bac5ad]">
            <span className="h-2 w-2 rounded-full bg-[#4c8d3d]" />
            Live learning, made human
          </p>
          <h1 className="text-center text-[2.7rem] font-medium leading-[0.98] tracking-[-0.06em] text-[#1b241c] md:text-[4rem] lg:text-left lg:text-[5.25rem] dark:text-[#f4f4f0]">
            Learn together,
            <br />
            anywhere.
          </h1>

          <p className="mt-6 max-w-[540px] text-center text-base text-[#3a443a] md:text-lg lg:text-left dark:text-[#b8c0b5]">
            Engaging live classes, verified educators, and authentic progress
            tracking built for real achievement.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-md bg-[#294321] px-6 py-3 text-sm font-bold text-[#f7f8f5] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Explore courses
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center rounded-md bg-[#eff3e9] px-6 py-3 text-sm font-semibold text-[#24351f] transition hover:-translate-y-0.5 hover:bg-white"
            >
              How it works
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 border-t border-[#dde4d8] pt-4 text-left text-xs text-[#3f4a40] dark:border-white/10 dark:text-[#b8c0b5]">
            <div className="flex -space-x-2" aria-hidden="true">
              {avatars.map((a) => (
                <span
                  key={a}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f2f1ec] bg-gradient-to-br from-[#e1e7da] to-[#bac4b2] text-[0.56rem] font-bold text-[#1f2b1d] dark:border-[#0b0d0b]"
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="flex flex-col text-[0.72rem] leading-snug">
              <span className="inline-flex items-center gap-1 font-bold text-[#1b241c] dark:text-[#f4f4f0]">
                <Star size={10} fill="currentColor" className="text-[#2b3d2a]" />
                4.9/5
              </span>
              <span>Over 12,000 verified hours taught</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="relative h-[340px] w-[340px] overflow-hidden rounded-full bg-[#dfe6d8] shadow-[0_30px_80px_rgba(0,0,0,0.15)] md:h-[430px] md:w-[430px] lg:h-[540px] lg:w-[540px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Ellipse1.jpg"
              alt="A smiling learner wearing headphones, studying on a laptop"
              className="h-full w-full object-cover object-[50%_45%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
