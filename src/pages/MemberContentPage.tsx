import Container from "../components/Container";
import PageHeading from "../components/PageHeading";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function MemberContentPage() {
  useDocumentMeta(
    "Espace membre",
    "Contenus réservés aux utilisateurs connectés et base d'extension pour gamification, matching et dashboard." 
  );

  return (
    <Container className="space-y-8">
      <PageHeading
        title="Espace membre"
        intro="Cette section est réservée aux utilisateurs connectés. Elle sert de base aux futures briques du produit."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Brique E</h2>
          <p className="mt-2 text-sm text-slate-700">Dashboard administrateur enrichi, KPI et suivi d'activité.</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Brique C</h2>
          <p className="mt-2 text-sm text-slate-700">Jeu, badges, points et récompenses communautaires.</p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Brique G</h2>
          <p className="mt-2 text-sm text-slate-700">Matching sportif via questionnaire et recommandations.</p>
        </article>
      </section>
    </Container>
  );
}

export default MemberContentPage;
