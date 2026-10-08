import type { ReactNode } from "react";
import DashNav from "@/components/dashboard/DashNav";
import DashSidebar from "@/components/dashboard/DashSidebar";

export default function DashboardShell({ children }: { children: ReactNode }) {
	return (
		<div className="learner-page flex h-screen overflow-hidden bg-[#f2f3ed]">
			<div className="h-screen shrink-0 pb-px pl-[7px] pt-[11px]">
				<DashSidebar />
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="shrink-0">
					<DashNav />
				</div>

				<main className="-mt-[5px] min-h-0 flex-1 overflow-y-auto pb-8 pl-4 pr-[31px] [scrollbar-color:#cddbbd_transparent] [scrollbar-width:thin]">
					{children}
				</main>
			</div>
		</div>
	);
}
