 import { useState } from "react";
 import {
   LayoutDashboard,
   Package,
   Truck,
   MapPin,
   FileText,
   Settings,
   LogOut,
   ChevronLeft,
   ChevronRight,
   Activity,
 } from "lucide-react";
 import { NavLink } from "@/components/NavLink";
 import { useLocation } from "react-router-dom";
 import { useAuth } from "@/contexts/AuthContext";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 
 const navItems = [
   { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
   { title: "Products", url: "/products", icon: Package },
   { title: "Suppliers", url: "/suppliers", icon: Truck },
   { title: "Regions", url: "/regions", icon: MapPin },
   { title: "Reports", url: "/reports", icon: FileText },
   { title: "Settings", url: "/settings", icon: Settings },
 ];
 
 export function AppSidebar() {
   const [collapsed, setCollapsed] = useState(false);
   const location = useLocation();
   const { signOut } = useAuth();
 
   const isActive = (path: string) => location.pathname === path;
 
   return (
     <aside
       className={cn(
         "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
         collapsed ? "w-16" : "w-64"
       )}
     >
       {/* Logo */}
       <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
         {!collapsed && (
           <div className="flex items-center gap-2">
             <Activity className="h-6 w-6 text-primary" />
             <span className="font-bold text-lg text-sidebar-foreground">DiverMon</span>
           </div>
         )}
         {collapsed && <Activity className="h-6 w-6 text-primary mx-auto" />}
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
       <nav className="flex-1 p-2 space-y-1">
         {navItems.map((item) => (
           <NavLink
             key={item.title}
             to={item.url}
             end
             className={cn(
               "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
               collapsed && "justify-center px-2"
             )}
             activeClassName="bg-sidebar-accent text-primary font-medium"
           >
             <item.icon className={cn("h-5 w-5", isActive(item.url) && "text-primary")} />
             {!collapsed && <span>{item.title}</span>}
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