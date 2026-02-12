import { useState } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  Atom,
  Users,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/B7-logo-nobg.png";
import logoDark from "@/assets/B7-logo-white.png";
import { useTheme } from "@/contexts/ThemeContext";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, userRole } = useAuth();
  const { theme } = useTheme();

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = userRole === "admin";

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Diversifikasi RM", url: "/diversifikasi", icon: Atom },
    { title: "Sample to QC", url: "/sample-qc", icon: FlaskConical },
    ...(isAdmin ? [
      { title: "Users", url: "/users", icon: Users },
      { title: "Log Aktivitas", url: "/activity-log", icon: History },
    ] : []),
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
        {!collapsed && (
          <img
            src={theme === "dark" ? logoDark : logoDark}
            alt="Logo"
            className="h-8 object-contain"
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.url) && "text-sidebar-primary")} />
            {!collapsed && <span className="truncate">{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
