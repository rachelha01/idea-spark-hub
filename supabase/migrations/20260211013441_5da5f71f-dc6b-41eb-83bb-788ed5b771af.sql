
-- Step 1: Add enum values only
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cpro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'qc';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ts';
