import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useFestivalMode } from "../contexts/FestivalModeContext";
import { EventItem } from "../types/domain";

type MatchingModalProps = {
  isOpen: boolean;
  availableEvents: EventItem[];
  onClose: () => void;
  onOpenEvent: (event: EventItem) => void;
};

type EnergyLevel = "douce" | "moderee" | "intense";
type GroupPreference = "solo" | "petit-groupe" | "collectif";
type FestivalRhythm = "douce" | "forme";

type FestivalProgramEntry = {
  id: number;
  time: string;
  title: string;
  subtitle: string;
  event: EventItem | null;
};

const FESTIVAL_CONSTRAINTS = [
  { id: "handicap", label: "Handicap moteur" },
  { id: "budget", label: "Petit budget" },
  { id: "timidite", label: "Timidité" },
  { id: "femmes", label: "Femmes uniquement" },
  { id: "accompagne", label: "Besoin d'être accompagné" }
] as const;

const FESTIVAL_TIMES = ["14h30", "15h", "16h30"];

const FESTIVAL_FALLBACK_PROGRAM: FestivalProgramEntry[] = [
  {
    id: 1,
    time: "14h30",
    title: "Basket Santé",
    subtitle: "Stand 4 · Stand 4, place centrale",
    event: null
  },
  {
    id: 2,
    time: "15h",
    title: "Initiation Cirque",
    subtitle: "Stand 2 · Stand 2, zone animation",
    event: null
  },
  {
    id: 3,
    time: "16h30",
    title: "Fitness doux",
    subtitle: "Stand 1 · Stand 1, espace bien-être",
    event: null
  }
];

function MatchingModal({ isOpen, availableEvents, onClose, onOpenEvent }: MatchingModalProps) {
  const { festivalMode } = useFestivalMode();
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [group, setGroup] = useState<GroupPreference | null>(null);
  const [festivalRhythm, setFestivalRhythm] = useState<FestivalRhythm>("douce");
  const [festivalConstraints, setFestivalConstraints] = useState<string[]>(["budget"]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEnergy(null);
      setGroup(null);
      setFestivalRhythm("douce");
      setFestivalConstraints(["budget"]);
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

  const standardResult = useMemo(() => {
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

  const festivalProgram = useMemo(() => {
    if (!festivalMode) return FESTIVAL_FALLBACK_PROGRAM;

    const now = Date.now();
    const sorted = [...availableEvents]
      .filter((event) => new Date(event.end_date).getTime() >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3);

    if (sorted.length === 0) return FESTIVAL_FALLBACK_PROGRAM;

    return FESTIVAL_TIMES.map((time, index) => {
      const event = sorted[index] ?? null;
      if (!event) {
        return FESTIVAL_FALLBACK_PROGRAM[index];
      }

      return {
        id: index + 1,
        time,
        title: event.title,
        subtitle: event.location,
        event
      };
    });
  }, [availableEvents, festivalMode]);

  function toggleFestivalConstraint(constraintId: string) {
    setFestivalConstraints((prev) =>
      prev.includes(constraintId)
        ? prev.filter((item) => item !== constraintId)
        : [...prev, constraintId]
    );
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={festivalMode ? "Matching festival" : "Matching sportif"}>
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      {festivalMode ? (
        <div className="absolute left-1/2 top-1/2 max-h-[92vh] w-[calc(100%-1rem)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-[#051770] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-[#244aab] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#8db7ff]">Matching</p>
              <p className="text-[24px] font-semibold leading-tight text-white">Créer ton programme</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-[#1f3f9a] px-2.5 py-1 text-sm font-semibold text-[#d6e3ff]">
              Fermer
            </button>
          </div>

          <div className="max-h-[calc(92vh-74px)] space-y-4 overflow-y-auto p-4">
            {step === 1 ? (
              <>
                <p className="text-sm font-semibold text-[#d6e3ff]">Étape 1 sur 2</p>
                <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                  <span className="h-2 rounded-full bg-[#9ec0ff]" />
                  <span className="h-2 rounded-full bg-[#244aab]" />
                </div>

                <h3 className="text-[24px] font-semibold leading-tight text-white">Comment tu veux vivre ton festival ?</h3>
                <p className="text-base text-[#c6d6ff]">Choisis le rythme qui servira à composer ton programme du jour.</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFestivalRhythm("douce")}
                    className={`w-full rounded-xl border px-3 py-3 text-left ${
                      festivalRhythm === "douce" ? "border-[#2d5fcf] bg-[#1f49ad] text-white" : "border-[#5579c7] bg-transparent text-white"
                    }`}
                  >
                    <p className="text-[18px] font-semibold">Je veux une activité douce</p>
                    <p className="mt-1 text-sm text-[#c6d6ff]">Un rythme calme, rassurant et progressif.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFestivalRhythm("forme")}
                    className={`w-full rounded-xl border px-3 py-3 text-left ${
                      festivalRhythm === "forme" ? "border-[#2d5fcf] bg-[#1f49ad] text-white" : "border-[#5579c7] bg-transparent text-white"
                    }`}
                  >
                    <p className="text-[18px] font-semibold">Je me sens en forme</p>
                    <p className="mt-1 text-sm text-[#c6d6ff]">Une séance plus tonique, avec de l&apos;élan et du collectif.</p>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={onClose} className="h-12 rounded-[56px] border border-[#a8c1ff] bg-transparent text-sm font-semibold text-white">
                    Fermer
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="h-12 rounded-[56px] bg-[#8db7ff] text-base font-medium text-[#0b1d57]">
                    Continuer
                  </button>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <p className="text-sm font-semibold text-[#d6e3ff]">Étape 2 sur 2</p>
                <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                  <span className="h-2 rounded-full bg-[#9ec0ff]" />
                  <span className="h-2 rounded-full bg-[#9ec0ff]" />
                </div>

                <h3 className="text-[24px] font-semibold leading-tight text-white">Qu&apos;est-ce qui est important pour toi ?</h3>
                <p className="text-base text-[#c6d6ff]">Tu peux choisir une ou plusieurs contraintes.</p>

                <div className="flex flex-wrap gap-2">
                  {FESTIVAL_CONSTRAINTS.map((constraint) => {
                    const isSelected = festivalConstraints.includes(constraint.id);
                    const isHighlighted = constraint.id === "budget";

                    return (
                      <button
                        key={constraint.id}
                        type="button"
                        onClick={() => toggleFestivalConstraint(constraint.id)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                          isSelected
                            ? isHighlighted
                              ? "border-[#f5de79] bg-[#f5de79] text-[#2e2852]"
                              : "border-[#2f64d5] bg-[#1f49ad] text-[#d7e4ff]"
                            : "border-[#4f6fb6] bg-transparent text-[#d7e4ff]"
                        }`}
                      >
                        {constraint.label}
                        {constraint.id === "handicap" ? <span className="ml-1 text-xs">▾</span> : null}
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-[#c6d6ff]">Tu pourras refaire ce matching quand tu veux.</p>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={onClose} className="h-12 rounded-[56px] border border-[#a8c1ff] bg-transparent text-sm font-semibold text-white">
                    Fermer
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="h-12 rounded-[56px] bg-[#8db7ff] text-base font-medium text-[#0b1d57]">
                    Voir ma séance
                  </button>
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <p className="text-sm font-semibold text-[#d6e3ff]">Résultat</p>
                <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                  <span className="h-2 rounded-full bg-[#9ec0ff]" />
                  <span className="h-2 rounded-full bg-[#9ec0ff]" />
                </div>

                <h3 className="text-[24px] font-semibold leading-tight text-white">Ton programme du jour</h3>
                <p className="text-base text-[#c6d6ff]">On a préparé un parcours simple et progressif pour t&apos;aider à profiter du festival à ton rythme.</p>

                <div className="relative overflow-hidden rounded-xl bg-[#dcaef0] p-4">
                  <span className="pointer-events-none absolute -right-7 -top-7 h-16 w-16 rounded-full border-[8px] border-[#c98ce6]" aria-hidden="true" />
                  <span className="inline-flex items-center rounded-full bg-[#e8d0f5] px-3 py-1 text-xs font-semibold text-[#6a4d86]">Parcours festival</span>
                  <p className="mt-2 text-[18px] font-semibold text-[#2a1f42]">Ton parcours du jour</p>

                  <div className="mt-3 space-y-2">
                    {festivalProgram.map((entry) => (
                      <article key={entry.id} className="flex items-start gap-3 rounded-xl bg-[#f4eaf8] p-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d7bbe9] text-xs font-semibold text-[#684d82]">
                          {entry.id}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-[#40305d]">{entry.time} · {entry.title}</p>
                          <p className="mt-0.5 truncate text-xs text-[#6d5b89]">{entry.subtitle}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button type="button" onClick={() => setStep(1)} className="h-12 w-full rounded-[56px] border border-[#a8c1ff] bg-transparent text-sm font-semibold text-white">
                    Refaire le matching
                  </button>

                  {festivalProgram[0]?.event ? (
                    <button
                      type="button"
                      onClick={() => onOpenEvent(festivalProgram[0].event as EventItem)}
                      className="h-12 w-full rounded-[56px] bg-[#8db7ff] text-base font-medium text-[#0b1d57]"
                    >
                      Activer mon programme
                    </button>
                  ) : (
                    <Link
                      to="/evenements"
                      onClick={onClose}
                      className="flex h-12 w-full items-center justify-center rounded-[56px] bg-[#8db7ff] text-base font-medium text-[#0b1d57]"
                    >
                      Activer mon programme
                    </Link>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/2 max-h-[92vh] w-[calc(100%-1rem)] max-w-[390px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-[#ececf1] px-4 py-3">
            <p className="text-sm font-semibold text-[#232325]">Trouve ton sport</p>
            <button type="button" onClick={onClose} className="rounded-full bg-[#f0f0f3] px-2.5 py-1 text-sm font-semibold text-[#4f4f52]">
              Fermer
            </button>
          </div>

          <div className="max-h-[calc(92vh-64px)] space-y-4 overflow-y-auto p-4">
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
                  <p className="text-[18px] font-semibold text-black">{standardResult.title}</p>
                  <p className="mt-2 text-sm text-[#868688]">{standardResult.hint}</p>
                  {standardResult.event ? (
                    <p className="mt-2 text-xs font-medium text-[#4f4f52]">
                      {new Date(standardResult.event.start_date).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })} · {standardResult.event.location}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {standardResult.tags.map((tag) => (
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
                  {standardResult.event ? (
                    <button
                      type="button"
                      onClick={() => onOpenEvent(standardResult.event as EventItem)}
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
      )}
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
