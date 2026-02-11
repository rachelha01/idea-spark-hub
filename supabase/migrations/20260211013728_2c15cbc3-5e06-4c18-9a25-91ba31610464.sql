
-- Add division column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS division text;

-- Create diversifikasi_rm table
CREATE TABLE public.diversifikasi_rm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tgl_kirim_cpro date,
  tgl_terima_di_ts date,
  kode_item text,
  nama_material text,
  manufacture text,
  no_batch_material text,
  alokasi text,
  kimia text,
  mikrobiologi text,
  sensori_material text,
  sensori_produk text,
  tgl_analisa_andev date,
  kondisi_penyimpanan_stabtest text,
  usia_penyimpanan text,
  tgl_terima_sampel_scale_up date,
  jenis_scale_up text,
  no_batch_scale_up text,
  tgl_dilakukan_scale_up date,
  tgl_kirim_sampel_ke_qc date,
  tes_fisik text,
  tes_sensori text,
  tes_kimia text,
  tes_mikrobiologi text,
  link_hasil_analisa text,
  status_scale_up text,
  jenis_stabtest text,
  tgl_masuk_stabtest date,
  tgl_jatuh_tempo date,
  tgl_selesai_stabtest date,
  tgl_report date,
  link_report text,
  kesimpulan text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.diversifikasi_rm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read diversifikasi_rm"
  ON public.diversifikasi_rm FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage diversifikasi_rm"
  ON public.diversifikasi_rm FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "CPro can insert diversifikasi_rm"
  ON public.diversifikasi_rm FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'cpro'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Division users can update diversifikasi_rm"
  ON public.diversifikasi_rm FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'cpro'::app_role) OR has_role(auth.uid(), 'qc'::app_role) OR has_role(auth.uid(), 'ts'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Delete diversifikasi_rm admin only"
  ON public.diversifikasi_rm FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_diversifikasi_rm_updated_at
  BEFORE UPDATE ON public.diversifikasi_rm
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create sample_qc table
CREATE TABLE public.sample_qc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pic text,
  identitas_ma text,
  kode_produk text,
  nama_produk text,
  batch text,
  kondisi_penyimpanan text,
  usia_sampel_angka numeric,
  usia_sampel_dmy text,
  jenis_pengujian text,
  no_ppoj text,
  revisi text,
  ma_oracle text,
  tgl_kirim date,
  tgl_selesai_analisa date,
  leadtime_analisa text,
  hasil_analisa text,
  status text,
  oos text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sample_qc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sample_qc"
  ON public.sample_qc FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage sample_qc"
  ON public.sample_qc FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "TS can insert sample_qc"
  ON public.sample_qc FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'ts'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Division users can update sample_qc"
  ON public.sample_qc FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'ts'::app_role) OR has_role(auth.uid(), 'qc'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Delete sample_qc admin only"
  ON public.sample_qc FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_sample_qc_updated_at
  BEFORE UPDATE ON public.sample_qc
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_name text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read activity_logs"
  ON public.activity_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert activity_logs"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage user_roles
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
