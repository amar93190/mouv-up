import { isSupabaseConfigured } from "../lib/supabase";

function SupabaseConfigNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Supabase n'est pas configuré. Crée un fichier <code>.env</code> à partir de <code>.env.example</code>
      pour activer l'authentification et les données dynamiques.
    </div>
  );
}

export default SupabaseConfigNotice;
