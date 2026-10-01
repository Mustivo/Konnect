"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isDark = theme === "dark";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("konnect-theme");
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("konnect-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
        isDark
          ? "border-white/10 bg-[#0b0d0b]/80"
          : "border-[#dfe5d8] bg-[#f5f3ee]/90"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-4 lg:px-12">
        <Logo />

        <nav
          id="primary-nav"
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col gap-2 px-5 py-4 shadow-2xl md:static md:flex md:flex-row md:items-center md:justify-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-8 ${
            isDark ? "border-b border-white/10 bg-[#0b0d0b]" : "border-b border-[#e9efe7] bg-[#f5f3ee]"
          }`}
          aria-label="Primary"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative rounded-none px-3 py-2 text-sm font-medium transition md:text-[1.05rem] ${
                pathname === l.href
                  ? isDark
                    ? "bg-transparent text-white after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:content-[''] after:bg-[#879b5c]"
                    : "bg-transparent text-[#1a261a] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:content-[''] after:bg-[#5a6b3d]"
                  : isDark
                    ? "text-white/75 hover:bg-white/5 hover:text-white"
                    : "text-[#1a261a] hover:bg-[#eef3ee]"
              }`}
              aria-current={pathname === l.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/login"
            className={`hidden text-base font-medium md:block ${
              isDark ? "text-white/90" : "text-[#1a261a]"
            }`}
          >
            Log In
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={!isDark}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-[#dfe8dc] bg-[#f3f6f1] text-[#1a261a] hover:bg-[#edf3eb]"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-[#dfe8dc] bg-[#f3f6f1] text-[#1a261a] hover:bg-[#edf3eb]"
            }`}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition md:hidden ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-[#dfe8dc] bg-[#f3f6f1] text-[#1a261a] hover:bg-[#edf3eb]"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
