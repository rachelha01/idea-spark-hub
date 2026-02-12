import { useState, useEffect, useMemo } from "react";
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
import { Plus, Search, Download, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { canEditField } from "@/lib/division-permissions";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const ALL_FIELDS = [
  { key: "pic", label: "PIC", type: "text" },
  { key: "identitas_ma", label: "Identitas MA", type: "text" },
  { key: "kode_produk", label: "Kode Produk", type: "text" },
  { key: "nama_produk", label: "Nama Produk", type: "text" },
  { key: "batch", label: "Batch", type: "text" },
  { key: "kondisi_penyimpanan", label: "Kondisi Penyimpanan", type: "text" },
  { key: "usia_sampel_angka", label: "Usia Sampel (angka)", type: "number" },
  { key: "usia_sampel_dmy", label: "Usia Sampel (D/M/Y)", type: "text" },
  { key: "jenis_pengujian", label: "Jenis Pengujian", type: "text" },
  { key: "no_ppoj", label: "No PPOJ", type: "text" },
  { key: "revisi", label: "Revisi", type: "text" },
  { key: "ma_oracle", label: "MA Oracle", type: "text" },
  { key: "tgl_kirim", label: "Tgl Kirim", type: "date" },
  { key: "tgl_selesai_analisa", label: "Tgl Selesai Analisa", type: "date" },
  { key: "leadtime_analisa", label: "Leadtime Analisa", type: "text" },
  { key: "hasil_analisa", label: "Hasil Analisa", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "oos", label: "OOS", type: "text" },
];

export default function SampleQC() {
  const { userRole } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [exportMonth, setExportMonth] = useState("");
  const [exportYear, setExportYear] = useState("");
  const [exportMaterial, setExportMaterial] = useState("");

  const fetchData = async () => {
    const { data: d } = await supabase.from("sample_qc").select("*").order("created_at", { ascending: false });
    setData(d ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const editableFields = useMemo(
    () => ALL_FIELDS.filter((f) => canEditField(userRole, "sample_qc", f.key)),
    [userRole]
  );

  const canCreate = userRole === "admin" || userRole === "ts";
  const canDelete = userRole === "admin";

  const openCreate = () => {
    setEditingItem(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const fd: Record<string, string> = {};
    editableFields.forEach((f) => {
      fd[f.key] = item[f.key]?.toString() ?? "";
    });
    setFormData(fd);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      const { error } = await supabase.from("sample_qc").update(formData).eq("id", editingItem.id);
      if (error) { toast.error(error.message); return; }
      await logActivity("update", "sample_qc", editingItem.id, formData);
      toast.success("Data berhasil diupdate");
    } else {
      const { error } = await supabase.from("sample_qc").insert(formData);
      if (error) { toast.error(error.message); return; }
      await logActivity("create", "sample_qc", undefined, formData);
      toast.success("Data berhasil ditambahkan");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const { error } = await supabase.from("sample_qc").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logActivity("delete", "sample_qc", id);
    toast.success("Data berhasil dihapus");
    fetchData();
  };

  const handleExport = async (format: "xlsx" | "pdf") => {
    if (!exportMonth || !exportYear || !exportMaterial) {
      toast.error("Pilih bulan, tahun, dan nama material untuk export");
      return;
    }
    toast.info(`Export ${format.toUpperCase()} akan segera tersedia (fitur template sedang dikembangkan)`);
  };

  const filtered = data.filter((d) =>
    (d.nama_produk ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (d.kode_produk ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const produkNames = [...new Set(data.map((d) => d.nama_produk).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Sample to QC</h1>
          <div className="flex flex-wrap gap-2">
            {canCreate && (
              <Button onClick={openCreate} size="sm">
                <Plus className="h-4 w-4 mr-1" /> Tambah
              </Button>
            )}
          </div>
        </div>

        {/* Export Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <Label className="text-xs">Bulan</Label>
                <Select value={exportMonth} onValueChange={setExportMonth}>
                  <SelectTrigger className="w-28"><SelectValue placeholder="Bulan" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tahun</Label>
                <Input className="w-24" placeholder="2026" value={exportYear} onChange={(e) => setExportYear(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Produk</Label>
                <Select value={exportMaterial} onValueChange={setExportMaterial}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                  <SelectContent>
                    {produkNames.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleExport("xlsx")}>
                <Download className="h-4 w-4 mr-1" /> XLSX
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari produk / kode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10">No</TableHead>
                  {ALL_FIELDS.map((f) => (
                    <TableHead key={f.key} className="whitespace-nowrap">{f.label}</TableHead>
                  ))}
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="sticky left-0 bg-card z-10">{idx + 1}</TableCell>
                    {ALL_FIELDS.map((f) => (
                      <TableCell key={f.key} className="whitespace-nowrap">
                        {item[f.key]?.toString() ?? "-"}
                      </TableCell>
                    ))}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex gap-1">
                        {editableFields.length > 0 && (
                          <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={ALL_FIELDS.length + 2} className="text-center py-8 text-muted-foreground">Belum ada data</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Data" : "Tambah Data"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {editableFields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-sm">{f.label}</Label>
                  <Input
                    type={f.type}
                    value={formData[f.key] ?? ""}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <Button onClick={handleSave} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
