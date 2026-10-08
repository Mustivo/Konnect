import DashNav from "@/components/dashboard/DashNav";
import DashSidebar from "@/components/dashboard/DashSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f2f3ed]">
      {/* Sidebar: fixed, never scrolls */}
      <div className="h-screen shrink-0 pb-px pl-[7px] pt-[11px]">
        <DashSidebar />
      </div>

      {/* Right side */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar: fixed, never scrolls */}
        <div className="shrink-0">
          <DashNav />
        </div>

        {/* Only this area scrolls */}
        <main className="-mt-[5px] min-h-0 flex-1 overflow-y-auto pb-8 pl-4 pr-[31px] [scrollbar-color:#cddbbd_transparent] [scrollbar-width:thin]">
          {children}
        </main>
      </div>
    </div>
  );
}