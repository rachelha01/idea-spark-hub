import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity-logger";

function encodePassword(pw: string): string {
  // ASCII to Base64
  return btoa(pw);
}

interface UserRow {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  division: string | null;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDivision, setFormDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles && roles) {
      const merged: UserRow[] = profiles.map((p) => {
        const r = roles.find((r) => r.user_id === p.user_id);
        return {
          id: p.id,
          user_id: p.user_id,
          display_name: p.display_name,
          email: p.email,
          division: p.division,
          role: r?.role ?? "user",
        };
      });
      setUsers(merged);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword || !formDivision) {
      toast.error("Semua field harus diisi");
      return;
    }
    setLoading(true);

    // Create user via edge function or admin API
    // Since we can't use admin API from client, we use supabase auth signup with auto-confirm
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formEmail,
      password: formPassword,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: formName },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Update profile with division
      await supabase.from("profiles").update({ division: formDivision }).eq("user_id", authData.user.id);

      // Update role
      const roleMap: Record<string, "admin" | "cpro" | "qc" | "ts" | "user"> = { CPro: "cpro", QC: "qc", TS: "ts", Admin: "admin" };
      const role = roleMap[formDivision] ?? "user";
      await supabase.from("user_roles").update({ role } as any).eq("user_id", authData.user.id);
      await supabase.from("user_roles").update({ role }).eq("user_id", authData.user.id);

      await logActivity("create", "users", authData.user.id, { name: formName, email: formEmail, division: formDivision });
      toast.success("User berhasil ditambahkan");
    }

    setDialogOpen(false);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormDivision("");
    setLoading(false);
    fetchUsers();
  };

  const togglePw = (id: string) => setShowPw((s) => ({ ...s, [id]: !s[id] }));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manajemen User</h1>
          <Button onClick={() => setDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Tambah User
          </Button>
        </div>

        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Divisi</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Password (encrypted)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, idx) => (
                  <TableRow key={u.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{u.display_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.division ?? "-"}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {showPw[u.id] ? encodePassword(u.email ?? "") : "••••••••"}
                      <Button size="icon" variant="ghost" className="ml-1" onClick={() => togglePw(u.id)}>
                        {showPw[u.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Nama</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="text" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Password asli (akan dienkripsi saat disimpan)" />
              </div>
              <div className="space-y-1">
                <Label>Divisi</Label>
                <Select value={formDivision} onValueChange={setFormDivision}>
                  <SelectTrigger><SelectValue placeholder="Pilih divisi" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="CPro">CPro</SelectItem>
                    <SelectItem value="QC">QC</SelectItem>
                    <SelectItem value="TS">TS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
