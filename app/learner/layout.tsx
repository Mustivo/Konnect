"use client";

import { useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

function LearnerThemeInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    const main = document.querySelector<HTMLElement>(".learner-main-scroll");
    if (main) main.scrollTop = 0;

    const savedTheme = window.localStorage.getItem("konnect-theme");
    const shouldUseLight = savedTheme !== "dark";

    document.documentElement.setAttribute("data-theme", shouldUseLight ? "light" : "dark");
    document.documentElement.classList.toggle("dark", !shouldUseLight);
    document.body.style.backgroundColor = shouldUseLight ? "#f2f3ed" : "#111510";

    if (!savedTheme) {
      window.localStorage.setItem("konnect-theme", "light");
    }

    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LearnerThemeInitializer />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}