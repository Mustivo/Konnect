import { GraduationCap, IdCard, MessageSquareText, ShieldCheck } from "lucide-react";

const checks = [
  { icon: IdCard, label: "ID Authenticated" },
  { icon: GraduationCap, label: "Degree Verified" },
  { icon: MessageSquareText, label: "Peer Interviewed" },
];

export default function Verified() {
  return (
    <section className="bg-gradient-to-b from-[#dfe9d4] via-[#d6e2cb] to-[#b5c9a9] px-5 py-20 text-[#1b241c] transition-colors lg:px-12 dark:from-[#1d2b1c] dark:via-[#182419] dark:to-[#101610] dark:text-[#f4f4f0]">
      <div className="mx-auto max-w-[1400px] text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#24381f] text-[#edf3ea]">
          <ShieldCheck size={20} />
        </span>

        <h2 className="mt-6 text-4xl font-medium tracking-[-0.05em] text-[#1b241c] md:text-5xl lg:text-7xl dark:text-[#f4f4f0]">
          Every teacher is verified.
          <br />
          Every time.
        </h2>

        <p className="mx-auto mt-7 max-w-[760px] text-base text-[#334233] md:text-lg dark:text-[#c0cabc]">
          No fake tutors, no scams. Each teacher is reviewed and approved before
          they can teach a single class.
        </p>

        <ul className="mt-16 flex flex-col items-center justify-center gap-6 border-t border-[#b8c9ae] pt-5 md:flex-row md:gap-14 dark:border-white/15">
          {checks.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1b241c] dark:text-[#f4f4f0]">
              <span className="inline-flex items-center justify-center text-[#24381f]">
                <Icon size={15} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
