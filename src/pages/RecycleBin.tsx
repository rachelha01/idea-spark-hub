import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";

type TableName = "diversifikasi_rm" | "sample_qc";

const TABLE_LABELS: Record<TableName, string> = {
  diversifikasi_rm: "Diversifikasi RM",
  sample_qc: "Sample to QC",
};

const TABLE_COLUMNS: Record<TableName, { key: string; label: string }[]> = {
  diversifikasi_rm: [
    { key: "no_rm", label: "No RM" },
    { key: "kode_item", label: "Kode Item" },
    { key: "nama_material", label: "Nama Material" },
    { key: "manufacture", label: "Manufacture" },
  ],
  sample_qc: [
    { key: "kode_produk", label: "Kode Produk" },
    { key: "nama_produk", label: "Nama Produk" },
    { key: "batch", label: "Batch" },
    { key: "pic", label: "PIC" },
  ],
};

function daysRemaining(deletedAt: string) {
  const deleted = new Date(deletedAt).getTime();
  const purgeAt = deleted + 30 * 24 * 60 * 60 * 1000;
  const diff = purgeAt - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function RecycleBinTable({ table }: { table: TableName }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from(table)
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [table]);

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from(table)
      .update({ deleted_at: null, deleted_by: null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logActivity("restore", table, id);
    toast.success("Data berhasil dipulihkan");
    fetchItems();
  };

  const handlePurge = async (id: string) => {
    if (!confirm("Hapus permanen data ini? Tindakan tidak dapat dibatalkan.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logActivity("purge", table, id);
    toast.success("Data dihapus permanen");
    fetchItems();
  };

  const columns = TABLE_COLUMNS[table];

  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className="whitespace-nowrap">{c.label}</TableHead>
              ))}
              <TableHead className="whitespace-nowrap">Dihapus</TableHead>
              <TableHead className="whitespace-nowrap">Sisa Waktu</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={columns.length + 3} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
            )}
            {!loading && items.length === 0 && (
              <TableRow><TableCell colSpan={columns.length + 3} className="text-center py-8 text-muted-foreground">Recycle Bin kosong</TableCell></TableRow>
            )}
            {items.map((item) => {
              const days = daysRemaining(item.deleted_at);
              return (
                <TableRow key={item.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="whitespace-nowrap text-sm">
                      {item[c.key] ?? "-"}
                    </TableCell>
                  ))}
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(item.deleted_at).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    <span className={days <= 7 ? "text-destructive font-medium" : ""}>
                      {days} hari lagi
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleRestore(item.id)} title="Pulihkan" className="text-green-600">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handlePurge(item.id)} title="Hapus Permanen" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function RecycleBin() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Recycle Bin</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <AlertTriangle className="h-4 w-4" />
            Data yang dihapus akan otomatis hilang permanen setelah 30 hari.
          </p>
        </div>

        <Tabs defaultValue="diversifikasi_rm">
          <TabsList>
            <TabsTrigger value="diversifikasi_rm">{TABLE_LABELS.diversifikasi_rm}</TabsTrigger>
            <TabsTrigger value="sample_qc">{TABLE_LABELS.sample_qc}</TabsTrigger>
          </TabsList>
          <TabsContent value="diversifikasi_rm" className="mt-4">
            <RecycleBinTable table="diversifikasi_rm" />
          </TabsContent>
          <TabsContent value="sample_qc" className="mt-4">
            <RecycleBinTable table="sample_qc" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
