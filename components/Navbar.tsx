"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-react";
import Logo from "./Logo";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout as logoutAction, setUser } from "@/lib/redux/slices/authSlice";
import type { ApiUser as ReduxApiUser, Role } from "@/lib/redux/types";
import { currentUser, logout as logoutApi, type ApiUser } from "@/lib/api/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    const storedTheme = window.localStorage.getItem("konnect-theme");
    const initialTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : "light";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("konnect-theme", theme);
  }, [theme, themeLoaded]);

  // Sync user profile when token exists in storage
  useEffect(() => {
    const toReduxUser = (u: ApiUser): ReduxApiUser => ({
      id: u.id,
      email: u.email,
      name:
        u.name ||
        `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
        u.username ||
        u.email,
      role: u.role as Role,
      first_name: u.first_name,
      last_name: u.last_name,
      username: u.username,
      phone: u.phone_number ?? null,
      is_active: u.is_verified ?? true,
      profile_image: u.avatar ?? null,
    });

    const syncUser = () => {
      if (typeof window === "undefined") return;
      const token = window.localStorage.getItem("konnect-access-token");
      if (!token) return;
      currentUser()
        .then((u: ApiUser) => {
          if (u) dispatch(setUser(toReduxUser(u)));
        })
        .catch(() => {
          // Token invalid or expired
        });
    };

    if (!user) {
      syncUser();
    }

    const handleUserUpdated = (event: Event) => {
      const updatedUser = (event as CustomEvent<ApiUser>).detail;
      if (updatedUser) dispatch(setUser(toReduxUser(updatedUser)));
      else syncUser();
    };

    const handleAuthExpired = () => {
      dispatch(logoutAction());
    };

    window.addEventListener("konnect-user-updated", handleUserUpdated);
    window.addEventListener("konnect-auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("konnect-user-updated", handleUserUpdated);
      window.removeEventListener("konnect-auth-expired", handleAuthExpired);
    };
  }, [dispatch, user]);

  // Handle escape and outside clicks for dropdowns
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setOpen(false);
        setUserMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setOpen(false);
    const refreshToken =
      typeof window !== "undefined"
        ? window.localStorage.getItem("konnect-refresh-token")
        : null;
    if (refreshToken) {
      logoutApi(refreshToken).catch(() => {});
    }
    dispatch(logoutAction());
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("konnect-access-token");
      window.localStorage.removeItem("konnect-refresh-token");
      document.cookie = "konnect-access-token=; path=/; max-age=0; SameSite=Lax";
    }
    router.push("/login?logged_out=1");
  };

  const isUserLoggedIn = mounted && (isAuthenticated || Boolean(user));
  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.name ||
      user.username ||
      "Account"
    : "Learner";
  const firstName = user
    ? user.first_name || user.name?.split(" ")[0] || user.username || "Account"
    : "Learner";
  const initials = fullName
    ? fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part: string) => part[0]?.toUpperCase() ?? "")
        .join("") || "K"
    : "K";

  const roleNormalized = String(user?.role ?? "").toUpperCase();
  const roleLabel =
    roleNormalized === "ADMIN"
      ? "Admin"
      : roleNormalized === "TEACHER"
        ? "Teacher"
        : "Learner";

  const dashboardHref =
    roleNormalized === "ADMIN"
      ? "/admin/dashboard"
      : roleNormalized === "TEACHER"
        ? "/teacher/dashboard"
        : "/learner/dashboard";

  const settingsHref =
    roleNormalized === "ADMIN"
      ? "/admin/settings"
      : roleNormalized === "TEACHER"
        ? "/teacher/settings"
        : "/learner/settings";

  return (
    <header
      className={`sticky top-0 z-[60] border-b backdrop-blur-xl transition-colors ${
        isDark
          ? "border-white/10 bg-[#0b0d0b]/80"
          : "border-[#dfe5d8] bg-[#f5f3ee]/90"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-6 px-3 py-4 sm:px-4 lg:px-6">
        <Logo />

        {open && (
          <button
            type="button"
            aria-label="Close menu"
            aria-hidden="true"
            className="fixed inset-0 top-[73px] z-20 bg-black/30 backdrop-blur-[2px] transition-opacity md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <nav
          id="primary-nav"
          className={`${
            open ? "flex" : "hidden"
          } absolute left-0 top-full z-40 w-1/2 flex-col items-start gap-2 border-r px-5 py-6 shadow-2xl md:static md:z-auto md:flex md:min-h-0 md:w-auto md:flex-row md:items-center md:justify-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:gap-8 ${
            isDark
              ? "min-h-[calc(100vh-73px)] border-white/10 bg-[#0b0d0b]"
              : "min-h-[calc(100vh-73px)] border-[#e9efe7] bg-[#f5f3ee]"
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
              onClick={() => {
                setOpen(false);
                setSearchOpen(false);
              }}
            >
              {l.label}
            </Link>
          ))}

          {/* Mobile Auth Section */}
          <div className="mt-3 flex w-full flex-col gap-2 border-t border-[#dfe5d8] pt-4 md:hidden dark:border-white/10">
            {isUserLoggedIn ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 rounded-lg bg-black/[0.03] p-2 dark:bg-white/5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#263d21] text-xs font-bold text-white shadow-sm dark:bg-[#344f2c]">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-xs font-bold text-[#1a261a] dark:text-white">
                      {fullName}
                    </p>
                    <p className="truncate text-[10px] text-[#65735f] dark:text-[#9aa592]">
                      {user?.email}
                    </p>
                  </div>
                  <span className="rounded bg-[#263d21]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#263d21] dark:bg-white/10 dark:text-[#b4e3a8]">
                    {roleLabel}
                  </span>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#263d21] px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#344f2c]"
                >
                  <LayoutDashboard size={14} />
                  <span>Go to Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-center text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                >
                  <LogOut size={13} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded border border-[#dfe5d8] px-3 py-2 text-center text-sm font-medium text-[#1a261a] dark:border-white/10 dark:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded bg-[#263d21] px-3 py-2 text-center text-sm font-medium text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Desktop User Profile or Login */}
          {isUserLoggedIn ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-2 rounded-full border py-1 pl-1.5 pr-3 transition-all ${
                  userMenuOpen
                    ? isDark
                      ? "border-[#879b5c] bg-white/10 text-white shadow-[0_0_15px_rgba(135,155,92,0.2)]"
                      : "border-[#5a6b3d] bg-[#eef3ee] text-[#1a261a] shadow-sm"
                    : isDark
                      ? "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10"
                      : "border-[#dfe5d8] bg-[#f9f8f4] text-[#1a261a] hover:border-[#ccd6c3] hover:bg-[#edf2ea]"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#263d21] text-[11px] font-bold text-white shadow-sm dark:bg-[#344f2c] dark:text-[#d8ebd0]">
                  {initials}
                </span>
                <span className="max-w-[120px] truncate text-xs font-semibold">
                  {firstName}
                </span>
                <span className="rounded bg-[#263d21]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#263d21] dark:bg-white/10 dark:text-[#b4e3a8]">
                  {roleLabel}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#65735f] transition-transform duration-200 dark:text-[#9aa592] ${
                    userMenuOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className={`absolute right-0 top-[calc(100%+8px)] z-50 w-60 origin-top-right rounded-xl border p-2 shadow-2xl backdrop-blur-xl transition-all ${
                    isDark
                      ? "border-white/10 bg-[#121712]/95 text-white shadow-black/70"
                      : "border-[#dfe5d8] bg-white/95 text-[#1a261a] shadow-slate-900/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 border-b border-current/10 p-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#263d21] text-xs font-bold text-white dark:bg-[#344f2c] dark:text-[#d8ebd0]">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-xs font-bold">{fullName}</p>
                      <p className="truncate text-[10px] opacity-60">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={dashboardHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition hover:bg-[#eef3ee] dark:hover:bg-white/10"
                    >
                      <LayoutDashboard
                        size={14}
                        className="text-[#3a532e] dark:text-[#b4e3a8]"
                      />
                      <span>Go to Dashboard</span>
                    </Link>

                    <Link
                      href={settingsHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition hover:bg-[#eef3ee] dark:hover:bg-white/10"
                    >
                      <Settings size={14} className="opacity-70" />
                      <span>Account Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-current/10 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={14} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className={`text-sm font-medium transition hover:opacity-80 ${
                  isDark ? "text-white/90" : "text-[#1a261a]"
                }`}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#263d21] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#344f2c]"
              >
                Sign up
              </Link>
            </div>
          )}

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
            onClick={() => {
              setSearchOpen((value) => !value);
              setOpen(false);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-[#dfe8dc] bg-[#f3f6f1] text-[#1a261a] hover:bg-[#edf3eb]"
            }`}
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
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

      {searchOpen && (
        <div
          className={`absolute right-5 top-full z-50 w-[min(360px,calc(100vw-2rem))] border p-3 shadow-xl lg:right-12 ${
            isDark
              ? "border-white/10 bg-[#121712] text-white"
              : "border-[#dfe5d8] bg-[#f9f8f3] text-[#1a261a]"
          }`}
        >
          <label htmlFor="site-search" className="sr-only">
            Search Konnect
          </label>
          <div className="flex items-center gap-2 border-b border-current/15 pb-2">
            <Search size={15} className="shrink-0 opacity-60" />
            <input
              id="site-search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Konnect"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
            />
          </div>
          <div className="mt-2">
            {links
              .filter((link) =>
                link.label.toLowerCase().includes(query.toLowerCase())
              )
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSearchOpen(false)}
                  className="block px-2 py-2 text-sm transition hover:bg-[#e8efe2] dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            {!links.some((link) =>
              link.label.toLowerCase().includes(query.toLowerCase())
            ) && (
              <p className="px-2 py-2 text-xs opacity-60">No matching pages.</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
