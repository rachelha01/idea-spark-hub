import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { addDays, isAfter, isBefore, format, subDays, subMonths, subYears, startOfWeek, startOfMonth, startOfYear } from "date-fns";

const COLORS = [
  "hsl(142, 71%, 45%)",  // MS - green
  "hsl(0, 84%, 60%)",    // TMS - red
  "hsl(38, 92%, 50%)",   // OP - orange
  "hsl(199, 89%, 48%)",
  "hsl(340, 75%, 55%)",
];

interface Warning {
  type: string;
  item: string;
  dueDate: string;
}

export default function Dashboard() {
  const { activeSite } = useSite();
  const [diversifikasiData, setDiversifikasiData] = useState<any[]>([]);
  const [sampleQcData, setSampleQcData] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [chartView, setChartView] = useState<"all" | "rm" | "qc">("all");
  const [periodFilter, setPeriodFilter] = useState<"week" | "month" | "year" | "all">("month");

  // Compute period start date
  const getPeriodStart = (): Date | null => {
    const now = new Date();
    switch (periodFilter) {
      case "week": return startOfWeek(now, { weekStartsOn: 1 });
      case "month": return startOfMonth(now);
      case "year": return startOfYear(now);
      case "all": return null;
    }
  };
  const periodStart = getPeriodStart();

  useEffect(() => {
    const fetchData = async () => {
      const twoWeeksAgo = format(subDays(new Date(), 14), "yyyy-MM-dd");

      let divQuery = supabase.from("diversifikasi_rm").select("*").order("created_at", { ascending: false }).limit(100);
      let sqcQuery = supabase.from("sample_qc").select("*").order("created_at", { ascending: false }).limit(500);

      if (activeSite !== "all") {
        divQuery = divQuery.eq("site", activeSite);
        sqcQuery = sqcQuery.eq("site", activeSite);
      }

      const [{ data: div }, { data: sqc }] = await Promise.all([divQuery, sqcQuery]);
      setDiversifikasiData(div ?? []);
      setSampleQcData(sqc ?? []);

      // Warnings: 2 days before tgl_jatuh_tempo
      const now = new Date();
      const warningDate = addDays(now, 2);
      const w: Warning[] = [];

      (div ?? []).forEach((d: any) => {
        if (d.tgl_jatuh_tempo) {
          const due = new Date(d.tgl_jatuh_tempo);
          if (isBefore(due, warningDate) && isAfter(due, addDays(now, -1))) {
            w.push({ type: "Diversifikasi RM", item: d.nama_material ?? d.kode_item, dueDate: d.tgl_jatuh_tempo });
          }
        }
      });

      (sqc ?? []).forEach((d: any) => {
        if (d.tgl_jatuh_tempo) {
          const due = new Date(d.tgl_jatuh_tempo);
          if (isBefore(due, warningDate) && isAfter(due, addDays(now, -1))) {
            w.push({ type: "Sample QC", item: d.nama_produk ?? d.kode_produk, dueDate: d.tgl_jatuh_tempo });
          }
        }
      });

      setWarnings(w);
    };
    fetchData();
  }, [activeSite]);

  // Apply period filter to both datasets
  const filterByPeriod = (items: any[], dateField: string) => {
    if (!periodStart) return items;
    return items.filter((item) => {
      const d = item[dateField] || item.created_at;
      if (!d) return false;
      return isAfter(new Date(d), periodStart);
    });
  };

  const filteredSampleQc = filterByPeriod(sampleQcData, "tgl_kirim");
  const filteredDiversifikasi = filterByPeriod(diversifikasiData, "created_at");

  // Line Chart: daily sample count within selected period
  const dailyCounts: Record<string, Record<string, number>> = {};
  filteredSampleQc.forEach((item) => {
    if (!item.tgl_kirim) return;
    const day = item.tgl_kirim;
    const name = item.nama_produk || "Unknown";
    if (!dailyCounts[day]) dailyCounts[day] = {};
    dailyCounts[day][name] = (dailyCounts[day][name] || 0) + 1;
  });

  // Get all unique product names for lines
  const allProducts = [...new Set(filteredSampleQc.filter(s => s.tgl_kirim).map((s) => s.nama_produk || "Unknown"))];

  const lineData = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, products]) => {
      const entry: any = { date: format(new Date(date), "dd/MM") };
      allProducts.forEach((p) => { entry[p] = products[p] || 0; });
      entry.total = Object.values(products).reduce((a, b) => a + b, 0);
      return entry;
    });

  // Donut Chart: hasil_analisa distribution (MS, TMS, OP)
  const hasilCounts = filteredSampleQc.reduce((acc: Record<string, number>, item) => {
    const h = item.hasil_analisa || "N/A";
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});
  const donutData = Object.entries(hasilCounts)
    .filter(([name]) => name !== "N/A")
    .map(([name, value]) => ({ name, value }));

  // Diversifikasi RM: distribusi status project
  const rmStatusCounts = filteredDiversifikasi.reduce((acc: Record<string, number>, item) => {
    const s = item.status_project || "N/A";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const rmStatusData = Object.entries(rmStatusCounts)
    .filter(([name]) => name !== "N/A")
    .map(([name, value]) => ({ name, value }));

  // Diversifikasi RM: distribusi kondisi penyimpanan
  const rmKondisiCounts = filteredDiversifikasi.reduce((acc: Record<string, number>, item) => {
    const k = item.kondisi_penyimpanan_stabtest || "N/A";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const rmKondisiData = Object.entries(rmKondisiCounts)
    .filter(([name]) => name !== "N/A")
    .map(([name, value]) => ({ name, value }));

  const LINE_COLORS = [
    "hsl(234, 56%, 38%)", "hsl(78, 100%, 37%)", "hsl(38, 92%, 50%)",
    "hsl(199, 89%, 48%)", "hsl(340, 75%, 55%)", "hsl(270, 60%, 50%)",
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="inline-flex rounded-md border border-border bg-card p-1 self-start">
            <Button
              size="sm"
              variant={chartView === "all" ? "default" : "ghost"}
              onClick={() => setChartView("all")}
            >
              Semua
            </Button>
            <Button
              size="sm"
              variant={chartView === "rm" ? "default" : "ghost"}
              onClick={() => setChartView("rm")}
            >
              Diversifikasi RM
            </Button>
            <Button
              size="sm"
              variant={chartView === "qc" ? "default" : "ghost"}
              onClick={() => setChartView("qc")}
            >
              Sample to QC
            </Button>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <span className="text-sm text-muted-foreground">Periode:</span>
          <div className="inline-flex rounded-md border border-border bg-card p-1 self-start">
            <Button size="sm" variant={periodFilter === "week" ? "default" : "ghost"} onClick={() => setPeriodFilter("week")}>Minggu Ini</Button>
            <Button size="sm" variant={periodFilter === "month" ? "default" : "ghost"} onClick={() => setPeriodFilter("month")}>Bulan Ini</Button>
            <Button size="sm" variant={periodFilter === "year" ? "default" : "ghost"} onClick={() => setPeriodFilter("year")}>Tahun Ini</Button>
            <Button size="sm" variant={periodFilter === "all" ? "default" : "ghost"} onClick={() => setPeriodFilter("all")}>Semua</Button>
          </div>
        </div>

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
                    <span className="inline-block bg-warning/20 text-warning text-xs px-1.5 py-0.5 rounded mr-2 font-medium">
                      {w.type}
                    </span>
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
          {/* Sample QC Charts */}
          {chartView !== "rm" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Jumlah Sample Harian (2 Minggu Terakhir)</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis fontSize={11} allowDecimals={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                      {allProducts.length <= 6 ? (
                        allProducts.map((product, i) => (
                          <Line
                            key={product}
                            type="monotone"
                            dataKey={product}
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        ))
                      ) : (
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Total Sample"
                          stroke="hsl(234, 56%, 38%)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hasil Analisa Sample QC</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={true}
                      >
                        {donutData.map((entry, i) => {
                          const colorMap: Record<string, string> = {
                            MS: COLORS[0],
                            TMS: COLORS[1],
                            OP: COLORS[2],
                          };
                          return <Cell key={i} fill={colorMap[entry.name] || COLORS[i % COLORS.length]} />;
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Diversifikasi RM Charts */}
          {chartView !== "qc" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Project Diversifikasi RM</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {rmStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rmStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {rmStatusData.map((_, i) => (
                            <Cell key={i} fill={LINE_COLORS[i % LINE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Belum ada data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kondisi Penyimpanan RM</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  {rmKondisiData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={rmKondisiData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {rmKondisiData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Belum ada data
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartView !== "rm" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sample to QC</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Produk</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Tgl Kirim</TableHead>
                      <TableHead>Tgl Selesai Analisa</TableHead>
                      <TableHead>Hasil Analisa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSampleQc.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.kode_produk ?? "-"}</TableCell>
                        <TableCell>{item.batch ?? "-"}</TableCell>
                        <TableCell>{item.tgl_kirim ? format(new Date(item.tgl_kirim), "dd/MM/yyyy") : "-"}</TableCell>
                        <TableCell>{item.tgl_selesai_analisa ? format(new Date(item.tgl_selesai_analisa), "dd/MM/yyyy") : "-"}</TableCell>
                        <TableCell>
                          {item.hasil_analisa ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.hasil_analisa === "MS" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                              item.hasil_analisa === "TMS" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            }`}>
                              {item.hasil_analisa}
                            </span>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSampleQc.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {chartView !== "qc" && (
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
                    {filteredDiversifikasi.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.kode_item ?? "-"}</TableCell>
                        <TableCell>{item.no_batch_material ?? "-"}</TableCell>
                        <TableCell>{item.kondisi_penyimpanan_stabtest ?? "-"}</TableCell>
                        <TableCell>{item.usia_penyimpanan ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                    {filteredDiversifikasi.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
