import type { ReactNode } from "react";
import DashNav from "@/components/dashboard/DashNav";
import DashSidebar from "@/components/dashboard/DashSidebar";

type DashboardShellProps = {
	children: ReactNode;
	role?: "learner" | "teacher";
};

export default function DashboardShell({ children, role = "learner" }: DashboardShellProps) {
	const isTeacher = role === "teacher";

	return (
		<div className={`learner-page ${isTeacher ? "teacher-page" : ""} flex h-screen overflow-hidden bg-[#f2f3ed] dark:bg-[#111510] text-[#171d15] dark:text-[#ecf1ea] transition-colors`}>
			<div className={isTeacher ? "h-screen shrink-0 py-0 pl-0 pr-0" : "h-screen shrink-0 pb-px pl-[7px] pt-[11px]"}>
				<DashSidebar role={role} />
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="shrink-0">
					<DashNav role={role} />
				</div>

				<main className={isTeacher ? "learner-main-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-8" : "learner-main-scroll -mt-[5px] min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-8 pl-2 pr-0"}>
					<div className="mx-auto w-full max-w-[1440px]">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
