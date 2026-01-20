import { 
  LayoutDashboard, 
  FileText, 
  Receipt,
  BarChart3,
  Users, 
  Package, 
  Settings,
  Plus
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Presupuestos", url: "/presupuestos", icon: FileText },
  { title: "Facturas", url: "/facturas", icon: Receipt },
  { title: "Facturación", url: "/facturas/dashboard", icon: BarChart3 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Catálogo", url: "/catalogo", icon: Package },
];

const configItems = [
  { title: "Configuración", url: "/configuracion", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <img 
            src={logo} 
            alt="Apuleyo Diseños" 
            className={cn(
              "object-contain",
              collapsed ? "w-8 h-8" : "w-10 h-10"
            )} 
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-sidebar-foreground">Apuleyo Diseños</span>
              <span className="text-xs text-sidebar-foreground/60">CRM Presupuestos</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && (
          <div className="p-4">
            <Button asChild className="w-full" size="sm">
              <NavLink to="/presupuestos/nuevo">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Presupuesto
              </NavLink>
            </Button>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={cn(
                        "flex items-center gap-2"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url}
                      className={cn(
                        "flex items-center gap-2"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/40 text-center">
            v1.0.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
