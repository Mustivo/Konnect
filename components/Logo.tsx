import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      aria-label="Konnect home"
      className="inline-flex items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/konnect-wordmark.png"
        alt="Konnect"
        className="h-10 w-auto dark:brightness-0 dark:invert"
      />
    </Link>
  );
}
