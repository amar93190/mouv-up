import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Header() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-extrabold text-slate-900">Solimouv’</Link>
          <nav className="flex items-center gap-2 text-sm">
            <NavLink to="/admin/evenements" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">Admin</NavLink>
            <NavLink to="/" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">App</NavLink>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="mx-auto w-full max-w-[430px] px-4 pt-4">
      <div className="mb-5 flex items-center justify-between">
        <Link to="/" aria-label="Aller à l'accueil">
          <img src="/images/solimouv-logo.svg" alt="Solimouv’" className="h-12 w-auto" />
        </Link>

        <Link
          to={isAuthenticated ? "/profil" : "/connexion"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e7e7ea] text-[#22262d]"
          aria-label={isAuthenticated ? "Ouvrir le profil" : "Se connecter"}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 19c.8-3.1 3.4-5 7-5s6.2 1.9 7 5" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

export default Header;
