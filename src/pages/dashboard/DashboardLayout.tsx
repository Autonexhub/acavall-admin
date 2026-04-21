import { Outlet } from 'react-router-dom';
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <ImpersonationBanner />
          <main className="flex-1 p-6 md:p-8 lg:p-10">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
