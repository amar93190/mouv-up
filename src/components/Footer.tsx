import { Link, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="hidden border-t border-slate-200 bg-white md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <p className="text-sm text-slate-600">Solimouv’ · Up Sport! · Plateforme inclusive</p>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Link to="/a-propos" className="hover:text-slate-900">À propos</Link>
          <Link to="/evenements" className="hover:text-slate-900">Événements</Link>
          <Link to="/contact" className="hover:text-slate-900">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
