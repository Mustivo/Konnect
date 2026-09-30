import Link from "next/link";

/**
 * Text version of the logo. To use your real logo, drop it in /public
 * (e.g. /public/logo.svg) and replace the <span> with:
 *   <Image src="/logo.svg" alt="Konnect" width={110} height={44} priority />
 */
export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Konnect home">
      <span>Konnect</span>
    </Link>
  );
}
