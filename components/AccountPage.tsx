import Image from "next/image";
import Link from "next/link";
import AccountForm from "@/components/AccountForm";
import PasswordRecovery from "@/components/PasswordRecovery";

type AccountPageProps = {
  mode: "login" | "forgot" | "reset-success";
};

export default function AccountPage({ mode }: AccountPageProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex min-h-[320px] flex-col items-center justify-start overflow-hidden bg-white px-6 pt-9 text-center md:min-h-screen md:w-[41%] md:pt-[12vh]">
        <Image
          src="/loginImage.png"
          alt="A learner studying with her laptop"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 41vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5" />
        <div className="relative z-10 max-w-[320px] text-[#20271d]">
          <h2 className="text-xl font-semibold leading-tight tracking-[-0.04em] md:text-[1.35rem]">
            A place to learn with<br />people, not beside them.
          </h2>
          <p className="mt-2 text-[0.58rem] text-[#84907a]">Small live classes · Verified educators · Clear progress</p>
        </div>
        <p className="absolute bottom-4 left-4 z-10 text-[0.5rem] text-[#6c7469]">© 2026 Konnect Inc.</p>
        <nav aria-label="Account access" className="absolute right-0 top-1/2 z-20 hidden w-20 -translate-y-1/2 flex-col md:flex">
          {(["login", "signup"] as const).map((route) => (
            <Link
              key={route}
              href={`/${route}`}
              aria-current={mode === route ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-l-full text-[0.72rem] font-semibold uppercase tracking-wide transition-colors ${
                mode === route ? "bg-[#f8f7f1] text-[#27351f]" : "text-[#27351f] hover:bg-black/[0.03]"
              }`}
            >
              {route === "login" ? "Log in" : "Sign up"}
            </Link>
          ))}
        </nav>
      </section>
      {mode === "login" ? <AccountForm /> : <PasswordRecovery mode={mode} />}
    </div>
  );
}
