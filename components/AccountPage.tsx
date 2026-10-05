import Image from "next/image";
import Link from "next/link";
import AccountForm from "@/components/AccountForm";
import PasswordRecovery from "@/components/PasswordRecovery";

type AccountPageProps = {
  mode: "login" | "signup" | "forgot" | "reset-success";
};

export default function AccountPage({ mode }: AccountPageProps) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex min-h-[250px] flex-col items-center justify-start overflow-hidden bg-white px-6 pt-9 text-center md:min-h-screen md:w-[38%] md:pt-[13vh]">
        <Image
          src="/Ellipse1.jpg"
          alt="A learner taking an online class"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 38vw"
          className="object-cover object-[center_34%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/10 to-transparent" />
        <div className="relative z-10 max-w-[320px]">
          <h2 className="text-xl font-semibold leading-tight tracking-[-0.04em] text-[#27351f] md:text-[1.35rem]">
            A place to learn with
            <br />
            people, not beside them.
          </h2>
          <p className="mt-2 text-[0.58rem] text-[#84907a]">
            Small live classes · Verified educators · Clear progress
          </p>
        </div>
          <nav
            aria-label="Account access"
            className="absolute right-0 top-1/2 z-20 hidden w-28 -translate-y-1/2 flex-col md:flex"
          >
            {(["login", "signup"] as const).map((route) => {
              const isActive = mode === route || (route === "login" && mode !== "signup");

              return (
                <Link
                  key={route}
                  href={`/${route}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center justify-center rounded-l-full text-[0.72rem] font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "bg-[#f8f7f1] text-[#27351f] dark:bg-[#10140f] dark:text-[#f4f4f0]"
                      : "text-[#27351f] hover:bg-black/[0.03]"
                  }`}
                >
                  {route === "login" ? "Log in" : "Sign up"}
                </Link>
              );
            })}
          </nav>
      </section>
      {mode === "login" || mode === "signup" ? (
        <AccountForm mode={mode} />
      ) : (
        <PasswordRecovery mode={mode} />
      )}
    </div>
  );
}
