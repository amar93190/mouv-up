import { useDocumentMeta } from "../hooks/useDocumentMeta";

function LegalNoticePage() {
  useDocumentMeta(
    "Mentions légales",
    "Mentions légales de la plateforme Solimouv’ éditée par Up Sport!."
  );

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <section>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] text-black md:text-[40px]">
          Mentions légales
        </h1>
        <p className="mt-2 max-w-[760px] text-base text-[#6b7280]">
          Les informations ci-dessous sont fournies à titre de modèle. Elles doivent être
          validées et complétées par le responsable légal du projet avant mise en production.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-[#fafafa] p-5 md:p-7">
        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Éditeur</h2>
          <p className="text-sm text-[#4b5563]">
            Solimouv’ est édité par Up Sport! (raison sociale à compléter), dont le siège social
            est situé à Paris (adresse complète à compléter).
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Responsable de publication</h2>
          <p className="text-sm text-[#4b5563]">
            Nom du responsable de publication à compléter.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Hébergement</h2>
          <p className="text-sm text-[#4b5563]">
            L’application est hébergée via l’infrastructure Vercel / Supabase (selon l’environnement
            de déploiement retenu).
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Propriété intellectuelle</h2>
          <p className="text-sm text-[#4b5563]">
            Les contenus, marques, logos et éléments graphiques de Solimouv’ sont protégés.
            Toute reproduction non autorisée est interdite.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Contact</h2>
          <p className="text-sm text-[#4b5563]">
            Pour toute question légale, utiliser le formulaire de contact ou l’adresse email
            de contact officielle (à compléter).
          </p>
        </article>
      </section>
    </div>
  );
}

export default LegalNoticePage;
