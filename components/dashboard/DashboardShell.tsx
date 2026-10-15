import type { ReactNode } from "react";
import DashNav from "@/components/dashboard/DashNav";
import DashSidebar from "@/components/dashboard/DashSidebar";

type DashboardShellProps = {
	children: ReactNode;
	role?: "learner" | "teacher" | "admin";
	teacherDashboard?: boolean;
};

export default function DashboardShell({ children, role = "learner", teacherDashboard = false }: DashboardShellProps) {
	const useTeacherPagePadding = role === "teacher" && !teacherDashboard;

	return (
		<div className="learner-page flex h-screen overflow-hidden bg-[#f2f3ed] dark:bg-[#111510] text-[#171d15] dark:text-[#ecf1ea] transition-colors">
			<div className="h-screen shrink-0">
				<DashSidebar role={role} />
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="shrink-0">
					<DashNav role={role} />
				</div>

				<main className={`learner-main-scroll ${useTeacherPagePadding ? "p-4" : "-mt-[5px] px-3 pb-8 sm:px-4"} min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto`}>
					<div className="w-full max-w-none">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
