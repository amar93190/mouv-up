import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../utils/cn";

type NavItem = {
  label: string;
  to: string;
  icon: "home" | "program" | "assos" | "pass";
};

const navItems: NavItem[] = [
  { label: "Accueil", to: "/", icon: "home" },
  { label: "Programme", to: "/evenements", icon: "program" },
  { label: "Assos", to: "/a-propos", icon: "assos" },
  { label: "Pass", to: "/profil", icon: "pass" }
];

function BottomNav() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <nav className="grid w-full max-w-[430px] grid-cols-4 gap-1" aria-label="Navigation mobile">
        {navItems.map((item) => {
          const to = item.icon === "pass" && !isAuthenticated ? "/connexion" : item.to;

          return (
            <NavLink
              key={item.label}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-700 transition",
                  isActive ? "bg-brand-500 text-white" : "hover:bg-slate-100"
                )
              }
            >
              <BottomIcon type={item.icon} />
              <span className="mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

type BottomIconProps = {
  type: NavItem["icon"];
};

function BottomIcon({ type }: BottomIconProps) {
  if (type === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }

  if (type === "program") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (type === "assos") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
        <path d="M3.5 19c.7-2.4 2.5-3.7 4.5-3.7 1.3 0 2.5.5 3.5 1.4 1-1 2.2-1.4 3.5-1.4 2 0 3.8 1.3 4.5 3.7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h10l3 5-8 11L4 9l3-5Z" />
    </svg>
  );
}

export default BottomNav;
