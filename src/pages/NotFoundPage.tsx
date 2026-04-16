import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function NotFoundPage() {
  useDocumentMeta("Page introuvable");

  return (
    <Container className="py-16">
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Page introuvable</h1>
        <p className="mt-3 text-sm text-slate-700">La route demandée n'existe pas.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Retour à l'accueil
        </Link>
      </section>
    </Container>
  );
}

export default NotFoundPage;
