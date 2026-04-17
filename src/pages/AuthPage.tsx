import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { useAuth } from "../hooks/useAuth";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function AuthPage() {
  useDocumentMeta("Connexion / Inscription");

  const { isAuthenticated, signIn, signUp } = useAuth();
  const { festivalMode } = useFestivalMode();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as { from?: string } | undefined)?.from ?? "/profil";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const error = await signIn(email, password);
        if (error) {
          setMessage(error);
          return;
        }

        navigate(redirectTo, { replace: true });
        return;
      }

      const error = await signUp(email, password, fullName);
      if (error) {
        setMessage(error);
        return;
      }

      setMessage("Compte créé. Vérifie ton email si la confirmation est activée.");
      navigate("/profil", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 pb-3 md:grid md:grid-cols-12 md:gap-8 md:space-y-0">
      <section className="md:col-span-5 md:pt-6">
        <h1 className={`text-6xl font-black leading-[0.9] md:text-[74px] ${festivalMode ? "text-white" : "text-[#0f1218]"}`}>Connexion</h1>
        <p className="mt-3 max-w-[340px] text-lg leading-snug text-[#7f828b]">
          Connecte-toi pour t'inscrire aux événements et accéder au Pass.
        </p>
      </section>

      <section
        className={`rounded-3xl p-4 md:col-span-7 md:p-8 ${
          festivalMode
            ? "border border-[#264db7] bg-[#0b297e] text-[#e8eeff]"
            : "bg-[#ededf1]"
        }`}
      >
        {isAuthenticated ? (
          <p className="mb-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Tu es déjà connecté. <Link to="/profil" className="underline">Accéder au profil</Link>
          </p>
        ) : null}

        <div className={`mb-3 grid grid-cols-2 gap-2 rounded-full p-1 ${festivalMode ? "bg-[#10328f]" : "bg-[#e2e3e8]"}`}>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-full px-3 py-2 text-sm font-semibold ${
              mode === "signin"
                ? festivalMode
                  ? "bg-[#7fa8ff] text-[#081a60]"
                  : "bg-brand-500 text-white"
                : festivalMode
                  ? "text-[#cdd9ff]"
                  : "text-[#525762]"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-3 py-2 text-sm font-semibold ${
              mode === "signup"
                ? festivalMode
                  ? "bg-[#7fa8ff] text-[#081a60]"
                  : "bg-brand-500 text-white"
                : festivalMode
                  ? "text-[#cdd9ff]"
                  : "text-[#525762]"
            }`}
          >
            Inscription
          </button>
        </div>

        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div>
              <label htmlFor="full-name" className={`mb-1 block text-sm font-medium ${festivalMode ? "text-[#e8eeff]" : "text-[#161a20]"}`}>Nom complet</label>
              <input
                id="full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className={`h-12 w-full rounded-2xl border px-4 text-sm ${
                  festivalMode
                    ? "border-[#3d61be] bg-[#112f86] text-white placeholder:text-[#aebeea]"
                    : "border-[#cfd2da] bg-white"
                }`}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="email" className={`mb-1 block text-sm font-medium ${festivalMode ? "text-[#e8eeff]" : "text-[#161a20]"}`}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={`h-12 w-full rounded-2xl border px-4 text-sm ${
                festivalMode
                  ? "border-[#3d61be] bg-[#112f86] text-white placeholder:text-[#aebeea]"
                  : "border-[#cfd2da] bg-white"
              }`}
            />
          </div>

          <div>
            <label htmlFor="password" className={`mb-1 block text-sm font-medium ${festivalMode ? "text-[#e8eeff]" : "text-[#161a20]"}`}>Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className={`h-12 w-full rounded-2xl border px-4 text-sm ${
                festivalMode
                  ? "border-[#3d61be] bg-[#112f86] text-white placeholder:text-[#aebeea]"
                  : "border-[#cfd2da] bg-white"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold disabled:opacity-60 ${
              festivalMode
                ? "bg-[#7fa8ff] text-[#081a60]"
                : "bg-brand-500 text-white"
            }`}
          >
            {isSubmitting ? "Traitement..." : mode === "signin" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        {message ? <p className={`mt-3 text-sm ${festivalMode ? "text-[#d3defd]" : "text-[#4e535d]"}`}>{message}</p> : null}
      </section>
    </div>
  );
}

export default AuthPage;
