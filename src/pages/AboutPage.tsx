import { useEffect, useState } from "react";
import LoadingState from "../components/LoadingState";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchOrganizations } from "../services/organizations";
import { Organization } from "../types/domain";

const fallbackPartners = [
  { name: "L'ÉVIDENCE", city: "Paris 18e" },
  { name: "FC CHEVANNES", city: "Saint-Denis" },
  { name: "BERRY BOIS & FORÊTS", city: "Paris 19e" },
  { name: "ÉCOLE DE COIFFURE ESTHETIQUE AURÉLIE B.", city: "Aubervilliers" },
  { name: "GAZ & MATÉRIEL D'AUVERGNE", city: "Paris 18e" }
];

function AboutPage() {
  useDocumentMeta("Associations", "Découvre les partenaires et associations du collectif Solimouv’ piloté par Up Sport!.");

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { festivalMode } = useFestivalMode();

  useEffect(() => {
    let active = true;

    async function loadOrganizations() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchOrganizations();
        if (!active) return;
        setOrganizations(data);
      } catch (serviceError) {
        if (!active) return;
        setError((serviceError as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrganizations();

    return () => {
      active = false;
    };
  }, []);

  const list = organizations.map((org) => ({ name: org.name, city: org.description ?? "Île-de-France" }));

  return (
    <div className="space-y-5 pb-3">
      <section>
        <h1 className={festivalMode ? "text-[32px] font-semibold tracking-[-0.01em] text-white" : "text-[32px] font-semibold tracking-[-0.01em] text-black"}>
          {festivalMode ? "Les équipes sur place" : "Nos partenaires"}
        </h1>
        <p className={festivalMode ? "mt-2 max-w-[352px] text-base text-[#cfdbff]" : "mt-2 max-w-[352px] text-base text-[#868688]"}>
          Des lieux accueillants pour pratiquer, rencontrer et rester en confiance.
        </p>
      </section>

      {loading ? <LoadingState /> : null}

      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

      {!loading && !error ? (
        <section className="space-y-3">
          {(list.length > 0 || !isSupabaseConfigured ? list : fallbackPartners).map((partner) => (
            <article
              key={partner.name}
              className={festivalMode
                ? "flex items-start justify-between rounded-lg border border-[#193f9c] bg-[#081a60] p-4"
                : "flex items-start justify-between rounded-lg bg-[#fafafa] p-4"}
            >
              <div>
                <h2 className={festivalMode ? "max-w-[260px] text-base font-semibold uppercase tracking-[-0.02em] text-white" : "max-w-[260px] text-base font-semibold uppercase tracking-[-0.02em] text-black"}>{partner.name}</h2>
                <p className={festivalMode ? "mt-2 text-base text-[#c5d7ff]" : "mt-2 text-base text-[#474749]"}>{partner.city}</p>
              </div>
              <span className={festivalMode ? "text-[36px] leading-none text-[#b7cdff]" : "text-[36px] leading-none text-[#232325]"}>+</span>
            </article>
          ))}
        </section>
      ) : null}

      {!loading && !error && isSupabaseConfigured && list.length === 0 ? (
        <p className="rounded-2xl bg-[#ededf1] p-4 text-sm text-[#5c6069]">Aucun partenaire trouvé dans Supabase.</p>
      ) : null}
    </div>
  );
}

export default AboutPage;
