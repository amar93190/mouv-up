import { Link, useLocation } from "react-router-dom";
import { useFestivalMode } from "../contexts/FestivalModeContext";

function Footer() {
  const location = useLocation();
  const { festivalMode } = useFestivalMode();

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className={festivalMode ? "hidden border-t border-[#173b90] bg-[#061457] md:block" : "hidden border-t border-slate-200 bg-white md:block"}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <p className={festivalMode ? "text-sm text-[#d2dcff]" : "text-sm text-slate-600"}>Solimouv’ · Up Sport! · Plateforme inclusive</p>
        <div className={festivalMode ? "flex items-center gap-3 text-sm text-[#d2dcff]" : "flex items-center gap-3 text-sm text-slate-600"}>
          <Link to="/a-propos" className={festivalMode ? "hover:text-white" : "hover:text-slate-900"}>À propos</Link>
          <Link to="/evenements" className={festivalMode ? "hover:text-white" : "hover:text-slate-900"}>Événements</Link>
          <Link to="/contact" className={festivalMode ? "hover:text-white" : "hover:text-slate-900"}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
