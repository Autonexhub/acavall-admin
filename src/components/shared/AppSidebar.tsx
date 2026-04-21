import { Calendar, Users, Building2, Clock, BarChart3, Shield, Settings, Home, LogOut, LayoutDashboard, Briefcase, User, UserX, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoAcavall from "@/assets/logo-acavall.png";
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const adminNavigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Sesiones", url: "/sessions", icon: Calendar },
  { title: "Entidades", url: "/entities", icon: Building2 },
  { title: "Personal", url: "/staff", icon: Users },
  { title: "Usuarios", url: "/users", icon: Shield },
  { title: "Proyectos", url: "/projects", icon: Briefcase },
  { title: "Administración", url: "/administration", icon: Clock },
  { title: "Impacto", url: "/impact", icon: BarChart3 },
];

const therapistNavigationItems = [
  { title: "Mis Sesiones", url: "/my-sessions", icon: Calendar },
  { title: "Mis Informes", url: "/my-reports", icon: FileText },
  { title: "Mi Perfil", url: "/my-profile", icon: User },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { logout, user, isImpersonating, stopImpersonating } = useAuth();

  // Determine navigation items based on user role
  const navigationItems = useMemo(() => {
    if (!user) return adminNavigationItems;
    return user.role === 'therapist' ? therapistNavigationItems : adminNavigationItems;
  }, [user]);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img src={logoAcavall} alt="Fundación Acavall" className="h-12 w-auto" />
          <div>
            <h2 className="font-semibold text-sm text-sidebar-foreground">Fundación Acavall</h2>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'therapist' ? 'Portal Personal' : 'Gestión de Sesiones'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                          isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          {user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {isImpersonating && user.impersonator && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">
                  👁️ Admin: {user.impersonator.name}
                </p>
              )}
            </div>
          )}
          {isImpersonating && (
            <SidebarMenuButton asChild>
              <button
                onClick={() => stopImpersonating()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-yellow-700 dark:text-yellow-400 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/20 font-medium border border-yellow-300 dark:border-yellow-700"
              >
                <UserX className="h-5 w-5" />
                <span>Salir de Visualización</span>
              </button>
            </SidebarMenuButton>
          )}
          <SidebarMenuButton asChild>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
