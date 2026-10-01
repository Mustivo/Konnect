import { GraduationCap, IdCard, MessageSquareText, ShieldCheck } from "lucide-react";

const checks = [
  { icon: IdCard, label: "ID Authenticated" },
  { icon: GraduationCap, label: "Degree Verified" },
  { icon: MessageSquareText, label: "Peer Interviewed" },
];

export default function Verified() {
  return (
    <section className="bg-gradient-to-r from-[#cbd9c0] to-[#304526] text-[#1b241c] transition-colors dark:from-[#9aaa8c] dark:to-[#142313] dark:text-[#f4f4f0]">
      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-2">
        <div className="min-h-[360px] overflow-hidden lg:min-h-[520px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=85"
            alt="Teacher sitting in a bright library"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-8 py-14 lg:px-16">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2d652f] text-[#edf3ea]">
            <ShieldCheck size={20} />
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-5xl">
            Every teacher is verified.
            <br />
            Every time.
          </h2>
          <p className="mt-6 max-w-[500px] text-sm leading-6 text-[#334233] dark:text-[#d5e0d0]">
            Identity, qualifications, and teaching practice are reviewed before
            an educator hosts a single class.
          </p>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#334233] dark:text-[#d5e0d0]">
            {checks.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon size={14} /> {label}
              </li>
            ))}
          </ul>
          <button type="button" className="mt-8 w-fit rounded bg-[#f4f5ed] px-5 py-2.5 text-xs font-semibold text-[#253720] transition hover:bg-white">
            Meet our instructors
          </button>
        </div>
      </div>
    </section>
  );
}
