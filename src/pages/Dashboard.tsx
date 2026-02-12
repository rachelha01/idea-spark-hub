import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { addDays, isAfter, isBefore, format } from "date-fns";

const COLORS = [
  "hsl(234, 56%, 38%)",
  "hsl(78, 100%, 37%)",
  "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)",
  "hsl(340, 75%, 55%)",
];

export default function Dashboard() {
  const [diversifikasiData, setDiversifikasiData] = useState<any[]>([]);
  const [sampleQcData, setSampleQcData] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: div }, { data: sqc }] = await Promise.all([
        supabase.from("diversifikasi_rm").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("sample_qc").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setDiversifikasiData(div ?? []);
      setSampleQcData(sqc ?? []);

      // Check due date warnings (2 days before)
      const now = new Date();
      const warningDate = addDays(now, 2);
      const w: any[] = [];
      (div ?? []).forEach((d) => {
        if (d.tgl_jatuh_tempo) {
          const due = new Date(d.tgl_jatuh_tempo);
          if (isBefore(due, warningDate) && isAfter(due, addDays(now, -1))) {
            w.push({
              type: "Diversifikasi RM",
              item: d.nama_material ?? d.kode_item,
              dueDate: d.tgl_jatuh_tempo,
            });
          }
        }
      });
      setWarnings(w);
    };
    fetchData();
  }, []);

  // Donut chart: Sample QC status distribution
  const statusCounts = sampleQcData.reduce((acc: Record<string, number>, item) => {
    const s = item.status || "N/A";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Line chart: items per month from diversifikasi
  const monthCounts = diversifikasiData.reduce((acc: Record<string, number>, item) => {
    if (item.tgl_kirim_cpro) {
      const m = format(new Date(item.tgl_kirim_cpro), "yyyy-MM");
      acc[m] = (acc[m] || 0) + 1;
    }
    return acc;
  }, {});
  const lineData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Card className="border-warning bg-warning/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-warning flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5" /> Peringatan Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {warnings.map((w, i) => (
                  <li key={i}>
                    <strong>{w.item}</strong> — jatuh tempo{" "}
                    {format(new Date(w.dueDate), "dd/MM/yyyy")}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diversifikasi RM per Bulan</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(234, 56%, 38%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Sample QC</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sample QC</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Produk</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Tgl Kirim</TableHead>
                    <TableHead>Hasil Analisa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleQcData.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.kode_produk}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>{item.tgl_kirim}</TableCell>
                      <TableCell>{item.hasil_analisa ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                  {sampleQcData.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diversifikasi RM</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode Item</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Kondisi Penyimpanan</TableHead>
                    <TableHead>Usia Penyimpanan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diversifikasiData.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.kode_item}</TableCell>
                      <TableCell>{item.no_batch_material}</TableCell>
                      <TableCell>{item.kondisi_penyimpanan_stabtest ?? "-"}</TableCell>
                      <TableCell>{item.usia_penyimpanan ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                  {diversifikasiData.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
