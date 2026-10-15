"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import DashNav from "@/components/dashboard/DashNav";
import DashSidebar from "@/components/dashboard/DashSidebar";
import TeacherClassCreator from "@/components/dashboard/TeacherClassCreator";
import { Menu, X } from "lucide-react";

type DashboardShellProps = {
	children: ReactNode;
	role?: "learner" | "teacher" | "admin";
	teacherDashboard?: boolean;
};

export default function DashboardShell({ children, role = "learner", teacherDashboard = false }: DashboardShellProps) {
	const isTeacher = role === "teacher";
	const useTeacherPagePadding = role === "teacher" && !teacherDashboard;
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	return (
		<div className={`learner-page ${isTeacher ? "teacher-page" : ""} flex h-screen overflow-hidden bg-[#f2f3ed] dark:bg-[#111510] text-[#171d15] dark:text-[#ecf1ea] transition-colors`}>
			<div className={isTeacher ? "hidden h-screen shrink-0 py-0 pl-0 pr-0 md:block" : "hidden h-screen shrink-0 pb-px pl-[7px] pt-[11px] md:block"}>
				<DashSidebar role={role} />
			</div>

			{mobileNavOpen && (
				<>
					<button
						type="button"
						aria-label="Close navigation menu"
						className="fixed inset-0 z-40 bg-black/40 md:hidden"
						onClick={() => setMobileNavOpen(false)}
					/>
					<div id="mobile-dashboard-sidebar" className="fixed inset-y-0 left-0 z-50 h-screen w-[min(252px,85vw)] md:hidden">
						<DashSidebar role={role} onNavigate={() => setMobileNavOpen(false)} />
					</div>
				</>
			)}

			<div className="flex min-h-0 min-w-0 flex-1 flex-col">
				<div className="shrink-0">
					<DashNav
						role={role}
						menuButton={
							<button
								type="button"
								aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
								aria-expanded={mobileNavOpen}
								aria-controls="mobile-dashboard-sidebar"
								onClick={() => setMobileNavOpen((open) => !open)}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e0e5dd] bg-white text-[#40522c] md:hidden dark:border-[#212f1f] dark:bg-[#141d13] dark:text-[#b4e3a8]"
							>
								{mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
							</button>
						}
					/>
				</div>

				<main className={`learner-main-scroll ${useTeacherPagePadding ? "p-4" : "-mt-[5px] px-3 pb-8 sm:px-4"} min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto`}>
					<div className="w-full max-w-none">
						{children}
					</div>
				</main>
			</div>

			{isTeacher && <TeacherClassCreator />}
		</div>
	);
}
