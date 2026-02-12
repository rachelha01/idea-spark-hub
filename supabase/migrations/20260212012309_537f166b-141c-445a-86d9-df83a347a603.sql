
-- Fix activity_logs insert policy to restrict to own user_id
DROP POLICY IF EXISTS "Authenticated can insert activity_logs" ON public.activity_logs;
CREATE POLICY "Users can insert own activity_logs"
  ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
