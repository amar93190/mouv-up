import { useDocumentMeta } from "../hooks/useDocumentMeta";

function RgpdPage() {
  useDocumentMeta(
    "RGPD",
    "Informations relatives au traitement des données personnelles sur Solimouv’."
  );

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <section>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] text-black md:text-[40px]">
          Politique RGPD
        </h1>
        <p className="mt-2 max-w-[760px] text-base text-[#6b7280]">
          Cette page présente le traitement des données personnelles de Solimouv’. Le contenu doit
          être validé juridiquement avant publication définitive.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl bg-[#fafafa] p-5 md:p-7">
        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Données collectées</h2>
          <p className="text-sm text-[#4b5563]">
            Données de compte (email, nom), données d’usage liées aux inscriptions aux événements,
            et informations techniques minimales nécessaires au service.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Finalités</h2>
          <p className="text-sm text-[#4b5563]">
            Gestion du compte utilisateur, gestion des inscriptions, suivi des points, communication
            liée aux événements, et amélioration de la plateforme.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Base légale</h2>
          <p className="text-sm text-[#4b5563]">
            Exécution du service demandé par l’utilisateur et intérêt légitime de l’éditeur pour
            l’amélioration de la plateforme.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Durée de conservation</h2>
          <p className="text-sm text-[#4b5563]">
            Les données sont conservées pendant la durée nécessaire au service, puis archivées
            ou supprimées selon les obligations légales applicables.
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Droits des personnes</h2>
          <p className="text-sm text-[#4b5563]">
            Vous disposez des droits d’accès, rectification, effacement, limitation, opposition
            et portabilité. Les demandes peuvent être adressées au contact RGPD (à compléter).
          </p>
        </article>

        <article className="space-y-1">
          <h2 className="text-lg font-semibold text-[#111827]">Sous-traitants</h2>
          <p className="text-sm text-[#4b5563]">
            Le service s’appuie sur des sous-traitants techniques (ex. Supabase) avec encadrement
            contractuel conforme au RGPD.
          </p>
        </article>
      </section>
    </div>
  );
}

export default RgpdPage;
