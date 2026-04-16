import { useEffect, useState } from "react";
import LoadingState from "../components/LoadingState";
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
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrganizations();

    return () => {
      active = false;
    };
  }, []);

  const list = organizations.length
    ? organizations.map((org) => ({ name: org.name, city: org.description ?? "Île-de-France" }))
    : fallbackPartners;

  return (
    <div className="space-y-5 pb-3">
      <section>
        <h1 className="text-6xl font-black leading-[0.9] text-[#0f1218]">Nos partenaires</h1>
        <p className="mt-3 max-w-[340px] text-lg leading-snug text-[#7f828b]">
          Des lieux accueillants pour pratiquer, rencontrer et rester en confiance.
        </p>
      </section>

      {loading ? <LoadingState /> : null}

      <section className="space-y-3">
        {list.map((partner) => (
          <article key={partner.name} className="flex items-center justify-between rounded-2xl bg-[#ededf1] p-4">
            <div>
              <h2 className="text-[28px] font-bold uppercase leading-tight text-[#14171e]">{partner.name}</h2>
              <p className="mt-1 text-[29px] text-[#4f535e]">{partner.city}</p>
            </div>
            <span className="text-4xl leading-none text-[#2a2e37]">+</span>
          </article>
        ))}
      </section>
    </div>
  );
}

export default AboutPage;
