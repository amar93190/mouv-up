import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { EventItem } from "../types/domain";

type MatchingModalProps = {
  isOpen: boolean;
  availableEvents: EventItem[];
  onClose: () => void;
  onOpenEvent: (event: EventItem) => void;
};

type EnergyLevel = "douce" | "moderee" | "intense";
type GroupPreference = "solo" | "petit-groupe" | "collectif";

function MatchingModal({ isOpen, availableEvents, onClose, onOpenEvent }: MatchingModalProps) {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [group, setGroup] = useState<GroupPreference | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEnergy(null);
      setGroup(null);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const result = useMemo(() => {
    if (!energy || !group) {
      return {
        event: null as EventItem | null,
        title: "Séances inclusives recommandées",
        tags: ["PMR", "Débutant"],
        hint: "On affine tes préférences pour te proposer un programme adapté."
      };
    }

    const energyKeywords: Record<EnergyLevel, string[]> = {
      douce: ["yoga", "doux", "douce", "mobilité", "mobilite", "marche", "santé", "sante", "étirement", "etirement"],
      moderee: ["marche", "mobilité", "mobilite", "fitness", "initiation", "decouverte", "découverte", "basket", "danse"],
      intense: ["football", "running", "course", "tournoi", "cardio", "intense", "collectif"]
    };

    const groupKeywords: Record<GroupPreference, string[]> = {
      solo: ["solo", "individuel", "personnalisé", "personnalise"],
      "petit-groupe": ["petit groupe", "atelier", "initiation", "encadré", "encadre"],
      collectif: ["collectif", "équipe", "equipe", "groupe", "football", "basket", "tournoi"]
    };

    const now = Date.now();
    const upcoming = availableEvents.filter((event) => new Date(event.end_date).getTime() >= now);
    const pool = upcoming.length > 0 ? upcoming : availableEvents;

    if (pool.length === 0) {
      return {
        event: null as EventItem | null,
        title: "Pas d'activité disponible",
        tags: [energy === "douce" ? "Douce" : energy === "moderee" ? "Modérée" : "Intense", group === "petit-groupe" ? "Petit groupe" : group === "collectif" ? "Collectif" : "Solo"],
        hint: "Aucune activité publiée pour le moment. Reviens bientôt ou consulte le programme."
      };
    }

    const ranked = pool
      .map((event) => {
        const text = `${event.title} ${event.short_description} ${event.long_description} ${event.location}`.toLowerCase();
        let score = 0;

        for (const keyword of energyKeywords[energy]) {
          if (text.includes(keyword)) score += 4;
        }

        for (const keyword of groupKeywords[group]) {
          if (text.includes(keyword)) score += 3;
        }

        if (group === "solo" && (text.includes("collectif") || text.includes("équipe") || text.includes("equipe"))) {
          score -= 2;
        }

        if (group === "collectif" && (text.includes("collectif") || text.includes("équipe") || text.includes("equipe"))) {
          score += 2;
        }

        const start = new Date(event.start_date).getTime();
        const end = new Date(event.end_date).getTime();
        if (now >= start && now <= end) score += 5;
        if (start > now) score += 2;

        return { event, score, start };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.start - b.start;
      });

    const top = ranked[0]?.event ?? null;

    return {
      event: top,
      title: top?.title ?? "Séance recommandée",
      tags: [energy === "douce" ? "Douce" : energy === "moderee" ? "Modérée" : "Intense", group === "petit-groupe" ? "Petit groupe" : group === "collectif" ? "Collectif" : "Solo"],
      hint:
        top?.short_description ??
        "On te propose cette activité selon ton énergie actuelle et ton format préféré."
    };
  }, [availableEvents, energy, group]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Matching sportif">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="absolute left-1/2 top-1/2 w-[calc(100%-1rem)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-[#ececf1] px-4 py-3">
          <p className="text-sm font-semibold text-[#232325]">Trouve ton sport</p>
          <button type="button" onClick={onClose} className="rounded-full bg-[#f0f0f3] px-2.5 py-1 text-sm font-semibold text-[#4f4f52]">
            Fermer
          </button>
        </div>

        <div className="space-y-4 p-4">
          {step === 1 ? (
            <>
              <h2 className="text-[24px] font-semibold leading-tight text-black">Quel rythme te convient aujourd&apos;hui ?</h2>
              <p className="text-base text-[#868688]">Choisis l'intensité qui respecte ton énergie actuelle.</p>

              <div className="space-y-2">
                <ChoiceButton label="Douce" selected={energy === "douce"} onClick={() => setEnergy("douce")} />
                <ChoiceButton label="Modérée" selected={energy === "moderee"} onClick={() => setEnergy("moderee")} />
                <ChoiceButton label="Intense" selected={energy === "intense"} onClick={() => setEnergy("intense")} />
              </div>

              <button
                type="button"
                disabled={!energy}
                onClick={() => setStep(2)}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-[56px] bg-[#0760fc] text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuer
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="text-[24px] font-semibold leading-tight text-black">Tu préfères pratiquer comment ?</h2>
              <p className="text-base text-[#868688]">On adapte le format selon ton confort social.</p>

              <div className="space-y-2">
                <ChoiceButton label="Solo" selected={group === "solo"} onClick={() => setGroup("solo")} />
                <ChoiceButton label="Petit groupe" selected={group === "petit-groupe"} onClick={() => setGroup("petit-groupe")} />
                <ChoiceButton label="Collectif" selected={group === "collectif"} onClick={() => setGroup("collectif")} />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="h-12 flex-1 rounded-[56px] border border-[#d9d9de] bg-white text-sm font-semibold text-[#4f4f52]">
                  Retour
                </button>
                <button
                  type="button"
                  disabled={!group}
                  onClick={() => setStep(3)}
                  className="h-12 flex-1 rounded-[56px] bg-[#0760fc] text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Voir mon résultat
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="text-[24px] font-semibold leading-tight text-black">Ta recommandation</h2>
              <div className="rounded-xl bg-[#fafafa] p-4">
                <p className="text-[18px] font-semibold text-black">{result.title}</p>
                <p className="mt-2 text-sm text-[#868688]">{result.hint}</p>
                {result.event ? (
                  <p className="mt-2 text-xs font-medium text-[#4f4f52]">
                    {new Date(result.event.start_date).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })} · {result.event.location}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#d6d8df] bg-white px-3 py-1 text-xs font-medium text-[#4f4f52]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="h-12 flex-1 rounded-[56px] border border-[#d9d9de] bg-white text-sm font-semibold text-[#4f4f52]">
                  Refaire
                </button>
                {result.event ? (
                  <button
                    type="button"
                    onClick={() => onOpenEvent(result.event as EventItem)}
                    className="flex h-12 flex-1 items-center justify-center rounded-[56px] bg-[#0760fc] text-base font-medium text-white"
                  >
                    Voir l&apos;activité
                  </button>
                ) : (
                  <Link
                    to="/evenements"
                    onClick={onClose}
                    className="flex h-12 flex-1 items-center justify-center rounded-[56px] bg-[#0760fc] text-base font-medium text-white"
                  >
                    Voir le programme
                  </Link>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

type ChoiceButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function ChoiceButton({ label, selected, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-sm font-medium transition ${
        selected ? "border-[#0760fc] bg-[#eef4ff] text-[#0a3ea8]" : "border-[#d9d9de] bg-white text-[#232325]"
      }`}
    >
      <span>{label}</span>
      <span className={`h-4 w-4 rounded-full border ${selected ? "border-[#0760fc] bg-[#0760fc]" : "border-[#bfc2cd]"}`} />
    </button>
  );
}

export default MatchingModal;
