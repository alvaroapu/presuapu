import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-3 md:px-4 bg-background sticky top-0 z-10">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex-1" />
          </header>
          <div className="flex-1 p-3 md:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
