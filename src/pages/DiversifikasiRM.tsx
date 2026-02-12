import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
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
  { key: "tgl_kirim_cpro", label: "Tgl Kirim CPro", type: "date" },
  { key: "tgl_terima_di_ts", label: "Tgl Terima di TS", type: "date" },
  { key: "kode_item", label: "Kode Item", type: "text" },
  { key: "nama_material", label: "Nama Material", type: "text" },
  { key: "manufacture", label: "Manufacture", type: "text" },
  { key: "no_batch_material", label: "No Batch Material", type: "text" },
  { key: "alokasi", label: "Alokasi", type: "text" },
  { key: "kimia", label: "Kimia", type: "text" },
  { key: "mikrobiologi", label: "Mikrobiologi", type: "text" },
  { key: "sensori_material", label: "Sensori Material", type: "text" },
  { key: "sensori_produk", label: "Sensori Produk", type: "text" },
  { key: "tgl_analisa_andev", label: "Tgl Analisa Andev", type: "date" },
  { key: "kondisi_penyimpanan_stabtest", label: "Kondisi Penyimpanan Stabtest", type: "text" },
  { key: "usia_penyimpanan", label: "Usia Penyimpanan", type: "text" },
  { key: "tgl_terima_sampel_scale_up", label: "Tgl Terima Sampel Scale Up", type: "date" },
  { key: "jenis_scale_up", label: "Jenis Scale Up", type: "text" },
  { key: "no_batch_scale_up", label: "No Batch Scale Up", type: "text" },
  { key: "tgl_dilakukan_scale_up", label: "Tgl Dilakukan Scale Up", type: "date" },
  { key: "tgl_kirim_sampel_ke_qc", label: "Tgl Kirim Sampel ke QC", type: "date" },
  { key: "tes_fisik", label: "Tes Fisik", type: "text" },
  { key: "tes_sensori", label: "Tes Sensori", type: "text" },
  { key: "tes_kimia", label: "Tes Kimia", type: "text" },
  { key: "tes_mikrobiologi", label: "Tes Mikrobiologi", type: "text" },
  { key: "link_hasil_analisa", label: "Link Hasil Analisa", type: "text" },
  { key: "status_scale_up", label: "Status Scale Up", type: "text" },
  { key: "jenis_stabtest", label: "Jenis Stabtest", type: "text" },
  { key: "tgl_masuk_stabtest", label: "Tgl Masuk Stabtest", type: "date" },
  { key: "tgl_jatuh_tempo", label: "Tgl Jatuh Tempo", type: "date" },
  { key: "tgl_selesai_stabtest", label: "Tgl Selesai Stabtest", type: "date" },
  { key: "tgl_report", label: "Tgl Report", type: "date" },
  { key: "link_report", label: "Link Report", type: "text" },
  { key: "kesimpulan", label: "Kesimpulan", type: "text" },
];

export default function DiversifikasiRM() {
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
    const { data: d } = await supabase.from("diversifikasi_rm").select("*").order("created_at", { ascending: false });
    setData(d ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const editableFields = useMemo(
    () => ALL_FIELDS.filter((f) => canEditField(userRole, "diversifikasi", f.key)),
    [userRole]
  );

  const canCreate = userRole === "admin" || userRole === "cpro";
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
      fd[f.key] = item[f.key] ?? "";
    });
    setFormData(fd);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      const { error } = await supabase.from("diversifikasi_rm").update(formData).eq("id", editingItem.id);
      if (error) { toast.error(error.message); return; }
      await logActivity("update", "diversifikasi_rm", editingItem.id, formData);
      toast.success("Data berhasil diupdate");
    } else {
      const { error } = await supabase.from("diversifikasi_rm").insert(formData);
      if (error) { toast.error(error.message); return; }
      await logActivity("create", "diversifikasi_rm", undefined, formData);
      toast.success("Data berhasil ditambahkan");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const { error } = await supabase.from("diversifikasi_rm").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logActivity("delete", "diversifikasi_rm", id);
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
    (d.nama_material ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (d.kode_item ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const materialNames = [...new Set(data.map((d) => d.nama_material).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">Diversifikasi RM</h1>
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
                <Label className="text-xs">Material</Label>
                <Select value={exportMaterial} onValueChange={setExportMaterial}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Pilih material" /></SelectTrigger>
                  <SelectContent>
                    {materialNames.map((n) => (
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
          <Input placeholder="Cari material / kode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                        {item[f.key] ?? "-"}
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
