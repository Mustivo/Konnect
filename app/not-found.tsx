import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f6f0] px-6 text-[#1b241c]">
      <div className="max-w-md text-center">
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[#60764f]">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-[#1b241c]">Page not found</h1>
        <p className="mt-3 text-base text-[#687267]">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded bg-[#263d21] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34512c]"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
