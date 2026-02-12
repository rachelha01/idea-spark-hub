// Which fields each division can edit

export const DIVERSIFIKASI_CPRO_FIELDS = [
  "tgl_kirim_cpro",
  "kode_item",
  "nama_material",
  "manufacture",
  "no_batch_material",
];

export const DIVERSIFIKASI_QC_FIELDS = [
  "kimia",
  "mikrobiologi",
  "sensori_material",
];

export const DIVERSIFIKASI_TS_FIELDS = [
  "tgl_terima_di_ts",
  "alokasi",
  "sensori_produk",
  "tgl_analisa_andev",
  "kondisi_penyimpanan_stabtest",
  "usia_penyimpanan",
  "tgl_terima_sampel_scale_up",
  "jenis_scale_up",
  "no_batch_scale_up",
  "tgl_dilakukan_scale_up",
  "tgl_kirim_sampel_ke_qc",
  "tes_fisik",
  "tes_sensori",
  "tes_kimia",
  "tes_mikrobiologi",
  "link_hasil_analisa",
  "status_scale_up",
  "jenis_stabtest",
  "tgl_masuk_stabtest",
  "tgl_jatuh_tempo",
  "tgl_selesai_stabtest",
  "tgl_report",
  "link_report",
  "kesimpulan",
];

export const SAMPLE_QC_QC_FIELDS = [
  "tgl_selesai_analisa",
  "hasil_analisa",
  "oos",
];

export const SAMPLE_QC_TS_FIELDS = [
  "pic",
  "identitas_ma",
  "kode_produk",
  "nama_produk",
  "batch",
  "kondisi_penyimpanan",
  "usia_sampel_angka",
  "usia_sampel_dmy",
  "jenis_pengujian",
  "no_ppoj",
  "revisi",
  "ma_oracle",
  "tgl_kirim",
  "leadtime_analisa",
  "status",
];

export function canEditField(
  role: string | null,
  table: "diversifikasi" | "sample_qc",
  field: string
): boolean {
  if (role === "admin") return true;

  if (table === "diversifikasi") {
    if (role === "cpro") return DIVERSIFIKASI_CPRO_FIELDS.includes(field);
    if (role === "qc") return DIVERSIFIKASI_QC_FIELDS.includes(field);
    if (role === "ts") return DIVERSIFIKASI_TS_FIELDS.includes(field);
  }

  if (table === "sample_qc") {
    if (role === "qc") return SAMPLE_QC_QC_FIELDS.includes(field);
    if (role === "ts") return SAMPLE_QC_TS_FIELDS.includes(field);
  }

  return false;
}
