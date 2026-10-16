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

    // Always keep dashboard in light mode
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#f2f3ed";

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