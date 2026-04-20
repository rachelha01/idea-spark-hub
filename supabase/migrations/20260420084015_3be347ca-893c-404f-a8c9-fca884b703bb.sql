-- Add soft delete columns to diversifikasi_rm and sample_qc
ALTER TABLE public.diversifikasi_rm 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE public.sample_qc 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

CREATE INDEX IF NOT EXISTS idx_diversifikasi_rm_deleted_at ON public.diversifikasi_rm(deleted_at);
CREATE INDEX IF NOT EXISTS idx_sample_qc_deleted_at ON public.sample_qc(deleted_at);

-- Function to auto-purge items older than 30 days in recycle bin
CREATE OR REPLACE FUNCTION public.purge_old_deleted_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.diversifikasi_rm 
    WHERE deleted_at IS NOT NULL AND deleted_at < (now() - INTERVAL '30 days');
  DELETE FROM public.sample_qc 
    WHERE deleted_at IS NOT NULL AND deleted_at < (now() - INTERVAL '30 days');
END;
$$;

-- Enable pg_cron for scheduled purge
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily purge at 02:00 UTC
DO $$
BEGIN
  PERFORM cron.unschedule('purge-recycle-bin-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'purge-recycle-bin-daily',
  '0 2 * * *',
  $$SELECT public.purge_old_deleted_records();$$
);