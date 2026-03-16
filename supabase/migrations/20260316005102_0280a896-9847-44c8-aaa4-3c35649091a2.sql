
-- Add site column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS site text DEFAULT NULL;

-- Add site column to sample_qc
ALTER TABLE public.sample_qc ADD COLUMN IF NOT EXISTS site text DEFAULT NULL;

-- Add site column to diversifikasi_rm
ALTER TABLE public.diversifikasi_rm ADD COLUMN IF NOT EXISTS site text DEFAULT NULL;
