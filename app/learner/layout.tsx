"use client";

import { useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";

function LearnerThemeInitializer() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("konnect-theme");
    const shouldUseLight = savedTheme !== "dark";

    document.documentElement.setAttribute("data-theme", shouldUseLight ? "light" : "dark");
    document.documentElement.classList.toggle("dark", !shouldUseLight);
    document.body.style.backgroundColor = shouldUseLight ? "#f2f3ed" : "#111510";

    if (!savedTheme) {
      window.localStorage.setItem("konnect-theme", "light");
    }
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