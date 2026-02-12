import { supabase } from "@/integrations/supabase/client";

export async function logActivity(
  action: string,
  tableName: string,
  recordId?: string,
  details?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("user_id", user.id)
    .single();

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    user_email: profile?.email ?? user.email ?? "",
    user_name: profile?.display_name ?? "",
    action,
    table_name: tableName,
    record_id: recordId,
    details: details as any,
  });
}
