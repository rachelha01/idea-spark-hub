import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user, userRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) ?? []);
  };

  const generateDueDateNotifications = async () => {
    if (!user) return;

    const now = new Date();
    const warningDate = addDays(now, 2);

    // Fetch diversifikasi_rm due dates
    const [{ data: divData }, { data: sqcData }] = await Promise.all([
      supabase.from("diversifikasi_rm").select("id, nama_material, kode_item, tgl_jatuh_tempo"),
      supabase.from("sample_qc").select("id, nama_produk, kode_produk, tgl_jatuh_tempo"),
    ]);

    const newNotifs: { title: string; message: string; type: string; source_table: string; source_id: string }[] = [];

    (divData ?? []).forEach((d: any) => {
      if (d.tgl_jatuh_tempo) {
        const due = new Date(d.tgl_jatuh_tempo);
        if (isBefore(due, warningDate) && isAfter(due, addDays(now, -1))) {
          newNotifs.push({
            title: "Jatuh Tempo Diversifikasi RM",
            message: `${d.nama_material ?? d.kode_item} — jatuh tempo ${format(due, "dd/MM/yyyy")}`,
            type: "warning",
            source_table: "diversifikasi_rm",
            source_id: d.id,
          });
        }
      }
    });

    (sqcData ?? []).forEach((d: any) => {
      if (d.tgl_jatuh_tempo) {
        const due = new Date(d.tgl_jatuh_tempo);
        if (isBefore(due, warningDate) && isAfter(due, addDays(now, -1))) {
          newNotifs.push({
            title: "Jatuh Tempo Sample QC",
            message: `${d.nama_produk ?? d.kode_produk} — jatuh tempo ${format(due, "dd/MM/yyyy")}`,
            type: "warning",
            source_table: "sample_qc",
            source_id: d.id,
          });
        }
      }
    });

    // Insert only if not already notified (check by source_id)
    const { data: existing } = await supabase
      .from("notifications")
      .select("source_id")
      .eq("user_id", user.id)
      .in("source_id", newNotifs.map((n) => n.source_id));

    const existingIds = new Set((existing ?? []).map((e: any) => e.source_id));
    const toInsert = newNotifs
      .filter((n) => !existingIds.has(n.source_id))
      .map((n) => ({ ...n, user_id: user.id }));

    if (toInsert.length > 0) {
      await supabase.from("notifications").insert(toInsert);
    }
  };

  useEffect(() => {
    if (!user) return;
    generateDueDateNotifications().then(() => fetchNotifications());
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-navbar-foreground hover:bg-primary/20">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifikasi</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={markAllRead}>
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Tidak ada notifikasi</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
                  !n.is_read && "bg-primary/5"
                )}
                onClick={() => markAsRead(n.id)}
              >
                <div className="flex items-start gap-2">
                  <div className={cn("mt-1 h-2 w-2 rounded-full shrink-0", !n.is_read ? "bg-warning" : "bg-transparent")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(n.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
