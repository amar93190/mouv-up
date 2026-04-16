import { supabase } from "../lib/supabase";
import { Organization } from "../types/domain";

export async function fetchOrganizations() {
  const { data, error } = await supabase
    .from("organizations")
    .select("id,name,slug,description,created_at")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Organization[];
}
