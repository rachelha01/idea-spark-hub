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
import { Plus, Search, Pencil, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { canEditField } from "@/lib/division-permissions";
import { logActivity } from "@/lib/activity-logger";
import { toast } from "sonner";
import { StatusBadge, StatusSelect, RESULT_OPTIONS, STATUS_OPTIONS, PROJECT_STATUS_OPTIONS } from "@/components/diversifikasi/StatusBadge";
import { calcLeadTime, formatLeadTime } from "@/lib/lead-time";
import { generateRmNumber } from "@/lib/rm-numbering";

// Field definitions grouped by section
interface FieldDef {
  key: string;
  label: string;
  type: "text" | "date" | "dropdown" | "computed";
  options?: string[];
  computeFrom?: { start: string; end: string };
}

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Diver RM",
    fields: [
      { key: "no_rm", label: "No", type: "computed" },
      { key: "status_project", label: "Status Project", type: "dropdown", options: PROJECT_STATUS_OPTIONS },
    ],
  },
  {
    title: "Informasi Umum",
    fields: [
      { key: "tgl_kirim_cpro", label: "Tgl Kirim CPro", type: "date" },
      { key: "tgl_terima_di_ts", label: "Tgl Terima di TS", type: "date" },
      { key: "kode_item", label: "Kode Item", type: "text" },
      { key: "nama_material", label: "Nama Material", type: "text" },
      { key: "manufacture", label: "Manufacture", type: "text" },
      { key: "no_batch_material", label: "No Batch Material", type: "text" },
    ],
  },
  {
    title: "Raw Material",
    fields: [
      { key: "rm_lead_time", label: "Lead Time", type: "computed", computeFrom: { start: "rm_tgl_kirim_qc", end: "rm_tgl_keluar_hasil" } },
      { key: "rm_tgl_kirim_qc", label: "Tgl Kirim QC", type: "date" },
      { key: "rm_tgl_keluar_hasil", label: "Tgl Keluar Hasil Analisa", type: "date" },
      { key: "rm_fisik", label: "Fisik", type: "dropdown", options: RESULT_OPTIONS },
      { key: "rm_kimia", label: "Kimia", type: "dropdown", options: RESULT_OPTIONS },
      { key: "rm_mikrobiologi", label: "Mikrobiologi", type: "dropdown", options: RESULT_OPTIONS },
      { key: "rm_sensori_material", label: "Sensori Material", type: "dropdown", options: RESULT_OPTIONS },
      { key: "rm_cek_karakteristik", label: "Cek Karakteristik RM", type: "dropdown", options: RESULT_OPTIONS },
      { key: "rm_status", label: "Status", type: "dropdown", options: STATUS_OPTIONS },
    ],
  },
  {
    title: "Alokasi Produk & Lab Scale - Produk",
    fields: [
      { key: "produk_lead_time", label: "Lead Time", type: "computed", computeFrom: { start: "produk_tgl_kirim_qc", end: "produk_tgl_keluar_hasil" } },
      { key: "produk_kode_item", label: "Kode Item Produk", type: "text" },
      { key: "produk_tgl_kirim_qc", label: "Tgl Kirim QC", type: "date" },
      { key: "produk_tgl_keluar_hasil", label: "Tgl Keluar Hasil", type: "date" },
      { key: "produk_fisik", label: "Fisik", type: "dropdown", options: RESULT_OPTIONS },
      { key: "produk_kimia", label: "Kimia", type: "dropdown", options: RESULT_OPTIONS },
      { key: "produk_mikrobiologi", label: "Mikrobiologi", type: "dropdown", options: RESULT_OPTIONS },
      { key: "produk_sensori", label: "Sensori", type: "dropdown", options: RESULT_OPTIONS },
      { key: "produk_cek_karakteristik", label: "Cek Karakteristik Produk", type: "dropdown", options: RESULT_OPTIONS },
    ],
  },
  {
    title: "Stabtest",
    fields: [
      { key: "stabtest_fisik", label: "Fisik", type: "dropdown", options: RESULT_OPTIONS },
      { key: "stabtest_kimia", label: "Kimia", type: "dropdown", options: RESULT_OPTIONS },
      { key: "stabtest_mikrobiologi", label: "Mikrobiologi", type: "dropdown", options: RESULT_OPTIONS },
      { key: "stabtest_sensori_dfct", label: "Sensori DFCT", type: "dropdown", options: RESULT_OPTIONS },
      { key: "stabtest_status", label: "Status", type: "dropdown", options: STATUS_OPTIONS },
      { key: "stabtest_keterangan", label: "Keterangan", type: "text" },
    ],
  },
  {
    title: "Scale Up/Commercial",
    fields: [
      { key: "scale_up_no_batch", label: "No Batch", type: "text" },
      { key: "scale_up_status", label: "Status", type: "dropdown", options: STATUS_OPTIONS },
      { key: "scale_up_tgl_dilakukan", label: "Tgl Dilakukan Scale Up", type: "date" },
      { key: "scale_up_tgl_kirim_qc", label: "Tgl Kirim Sampel ke QC", type: "date" },
      { key: "scale_up_tgl_keluar_hasil", label: "Tgl Keluar Hasil Analisa", type: "date" },
      { key: "scale_up_link_file", label: "Link File Diversifikasi", type: "text" },
      { key: "scale_up_kesimpulan", label: "Kesimpulan", type: "text" },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);
const ALL_FIELD_KEYS = ALL_FIELDS.filter(f => f.type !== "computed" || f.key === "no_rm").map(f => f.key);

export default function DiversifikasiRM() {
  const { userRole } = useAuth();
  const { activeSite } = useSite();
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isReentry, setIsReentry] = useState(false);

  const fetchData = async () => {
    let query = supabase.from("diversifikasi_rm").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (activeSite !== "all") query = query.eq("site", activeSite);
    const { data: d } = await query;
    setData(d ?? []);
  };

  useEffect(() => { fetchData(); }, [activeSite]);

  const canCreate = userRole === "admin" || userRole === "cpro";
  const canDelete = userRole === "admin";

  const openCreate = async () => {
    setEditingItem(null);
    setIsReentry(false);
    // Generate RM number
    const existingNumbers = data.map((d) => d.no_rm).filter(Boolean);
    const newNo = generateRmNumber(existingNumbers);
    setFormData({ no_rm: newNo });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsReentry(false);
    const fd: Record<string, string> = {};
    ALL_FIELD_KEYS.forEach((key) => {
      fd[key] = item[key] ?? "";
    });
    setFormData(fd);
    setDialogOpen(true);
  };

  const openReentry = (item: any) => {
    setEditingItem(null); // null = will insert new row
    setIsReentry(true);
    // Keep no_rm, clear all other fields for re-entry (new row, same no_rm)
    const fd: Record<string, string> = { no_rm: item.no_rm };
    ALL_FIELD_KEYS.forEach((key) => {
      if (key !== "no_rm") fd[key] = "";
    });
    setFormData(fd);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Remove computed fields (lead times) from save data
    const saveData: Record<string, any> = {};
    for (const key of ALL_FIELD_KEYS) {
      if (key === "rm_lead_time" || key === "produk_lead_time") continue;
      if (formData[key] !== undefined && formData[key] !== "") {
        saveData[key] = formData[key];
      }
    }

    if (editingItem) {
      const { error } = await supabase.from("diversifikasi_rm").update(saveData).eq("id", editingItem.id);
      if (error) { toast.error(error.message); return; }
      await logActivity("update", "diversifikasi_rm", editingItem.id, saveData);
      toast.success("Data berhasil diupdate");
    } else {
      const insertData = { ...saveData, ...(activeSite !== "all" ? { site: activeSite } : {}) };
      const { error } = await supabase.from("diversifikasi_rm").insert(insertData);
      if (error) { toast.error(error.message); return; }
      await logActivity("create", "diversifikasi_rm", undefined, saveData);
      toast.success(isReentry ? "Data isi ulang berhasil ditambahkan" : "Data berhasil ditambahkan");
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini? Data akan dipindahkan ke Recycle Bin selama 30 hari.")) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("diversifikasi_rm")
      .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    await logActivity("delete", "diversifikasi_rm", id);
    toast.success("Data dipindahkan ke Recycle Bin");
    fetchData();
  };

  // Check if an item is locked (rejected + has a re-entry row with same no_rm)
  const isItemLocked = (item: any) => {
    const isRejected = item.rm_status === "Reject" || item.stabtest_status === "Reject" || item.scale_up_status === "Reject";
    if (!isRejected || !item.no_rm) return false;
    // Check if another row with same no_rm exists that was created after this one
    return data.some(d => d.id !== item.id && d.no_rm === item.no_rm && new Date(d.created_at) > new Date(item.created_at));
  };

  const filtered = data.filter((d) => {
    const s = search.toLowerCase();
    return (
      (d.nama_material ?? "").toLowerCase().includes(s) ||
      (d.kode_item ?? "").toLowerCase().includes(s) ||
      (d.manufacture ?? "").toLowerCase().includes(s) ||
      (d.no_batch_material ?? "").toLowerCase().includes(s) ||
      (d.no_rm ?? "").toLowerCase().includes(s)
    );
  });

  const isDropdownField = (key: string) => {
    const field = ALL_FIELDS.find(f => f.key === key);
    return field?.type === "dropdown";
  };

  const getFieldOptions = (key: string) => {
    const field = ALL_FIELDS.find(f => f.key === key);
    return field?.options ?? [];
  };

  const renderCellValue = (item: any, field: FieldDef) => {
    if (field.type === "computed" && field.computeFrom) {
      const days = calcLeadTime(item[field.computeFrom.start], item[field.computeFrom.end]);
      return formatLeadTime(days);
    }
    if (field.type === "dropdown") {
      return <StatusBadge value={item[field.key]} />;
    }
    return item[field.key] ?? "-";
  };

  const canFieldBeEdited = (key: string) => canEditField(userRole, "diversifikasi", key);

  // For the dialog, determine which fields to show
  const getDialogFields = () => {
    return SECTIONS.flatMap(s => s.fields).filter(f => {
      if (f.type === "computed" && f.key !== "no_rm") return false;
      if (f.key === "no_rm") return true; // show but readonly
      return canFieldBeEdited(f.key);
    });
  };

  const dialogFields = getDialogFields();

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

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari no RM, kode item, nama material, manufacture..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                {/* Section group headers */}
                <TableRow>
                  <TableHead rowSpan={2} className="sticky left-0 bg-card z-10 border-r">No</TableHead>
                  {SECTIONS.map((section) => (
                    <TableHead
                      key={section.title}
                      colSpan={section.fields.length}
                      className="text-center border-x bg-muted/50 font-semibold text-xs"
                    >
                      {section.title}
                    </TableHead>
                  ))}
                  <TableHead rowSpan={2} className="border-l">Aksi</TableHead>
                </TableRow>
                {/* Individual column headers */}
                <TableRow>
                  {SECTIONS.flatMap((section) =>
                    section.fields.map((f) => (
                      <TableHead key={f.key} className="whitespace-nowrap text-xs border-x">
                        {f.label}
                      </TableHead>
                    ))
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="sticky left-0 bg-card z-10 border-r">{idx + 1}</TableCell>
                    {SECTIONS.flatMap((section) =>
                      section.fields.map((f) => (
                        <TableCell key={f.key} className="whitespace-nowrap text-sm border-x">
                          {renderCellValue(item, f)}
                        </TableCell>
                      ))
                    )}
                    <TableCell className="whitespace-nowrap border-l">
                      <div className="flex gap-1">
                        {isItemLocked(item) ? (
                          <span className="text-xs text-muted-foreground italic px-2">Terkunci</span>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => openEdit(item)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {(item.rm_status === "Reject" || item.stabtest_status === "Reject" || item.scale_up_status === "Reject") && canCreate && (
                              <Button size="icon" variant="ghost" onClick={() => openReentry(item)} title="Isi Ulang" className="text-yellow-600">
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive" title="Hapus">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={ALL_FIELDS.length + 2} className="text-center py-8 text-muted-foreground">
                      Belum ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Data" : isReentry ? "Isi Ulang Data" : "Tambah Data"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {SECTIONS.map((section) => {
                const sectionDialogFields = section.fields.filter(f => {
                  if (f.type === "computed" && f.key !== "no_rm") return false;
                  if (f.key === "no_rm") return true;
                  return canFieldBeEdited(f.key);
                });
                if (sectionDialogFields.length === 0) return null;
                return (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 border-b pb-1">
                      {section.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sectionDialogFields.map((f) => (
                        <div key={f.key} className="space-y-1">
                          <Label className="text-sm">{f.label}</Label>
                          {f.key === "no_rm" ? (
                            <Input value={formData.no_rm ?? ""} disabled className="bg-muted" />
                          ) : f.type === "dropdown" ? (
                            <StatusSelect
                              value={formData[f.key] ?? ""}
                              onChange={(v) => setFormData({ ...formData, [f.key]: v })}
                              options={f.options ?? []}
                            />
                          ) : (
                            <Input
                              type={f.type === "date" ? "date" : "text"}
                              value={formData[f.key] ?? ""}
                              onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              <Button onClick={handleSave} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
