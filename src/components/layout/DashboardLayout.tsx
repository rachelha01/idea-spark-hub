import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import logoLight from "@/assets/B7-logo-nobg.png";
import logoDark from "@/assets/B7-logo-white.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { userName, userRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-50 w-64 h-full">
            <AppSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-navbar text-navbar-foreground flex items-center justify-between px-4 shrink-0 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-navbar-foreground hover:bg-primary/20"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Logo"
              className="h-8 object-contain hidden sm:block"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block">
              {userName} <span className="opacity-70">({userRole})</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-navbar-foreground hover:bg-primary/20"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
