// Which fields each division can edit

export const DIVERSIFIKASI_CPRO_FIELDS = [
  "tgl_kirim_cpro",
  "kode_item",
  "nama_material",
  "manufacture",
  "no_batch_material",
];

export const DIVERSIFIKASI_QC_FIELDS = [
  "rm_fisik",
  "rm_kimia",
  "rm_mikrobiologi",
  "rm_sensori_material",
  "rm_cek_karakteristik",
  "rm_status",
  "rm_tgl_keluar_hasil",
  "produk_fisik",
  "produk_kimia",
  "produk_mikrobiologi",
  "produk_sensori",
  "produk_cek_karakteristik",
  "produk_tgl_keluar_hasil",
  "stabtest_fisik",
  "stabtest_kimia",
  "stabtest_mikrobiologi",
  "stabtest_sensori_dfct",
  "stabtest_status",
  "stabtest_keterangan",
];

export const DIVERSIFIKASI_TS_FIELDS = [
  "tgl_terima_di_ts",
  "rm_tgl_kirim_qc",
  "produk_kode_item",
  "produk_tgl_kirim_qc",
  "scale_up_no_batch",
  "scale_up_status",
  "scale_up_tgl_dilakukan",
  "scale_up_tgl_kirim_qc",
  "scale_up_tgl_keluar_hasil",
  "scale_up_link_file",
  "scale_up_kesimpulan",
  "status_project",
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
