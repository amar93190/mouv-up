import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type MatchingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type EnergyLevel = "douce" | "moderee" | "intense";
type GroupPreference = "solo" | "petit-groupe" | "collectif";

function MatchingModal({ isOpen, onClose }: MatchingModalProps) {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [group, setGroup] = useState<GroupPreference | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setEnergy(null);
      setGroup(null);
      return;
    }

    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  const result = useMemo(() => {
    if (!energy || !group) {
      return {
        title: "Séances inclusives recommandées",
        tags: ["PMR", "Débutant"],
        hint: "On affine tes préférences pour te proposer un programme adapté."
      };
    }

    if (energy === "douce") {
      return {
        title: "Yoga doux inclusif",
        tags: ["PMR", "Débutant", group === "solo" ? "Solo" : "Petit groupe"],
        hint: "Une séance calme pour reprendre confiance et bouger en douceur."
      };
    }

    if (energy === "moderee") {
      return {
        title: "Marche active & mobilité",
        tags: ["Mixte", group === "collectif" ? "Collectif" : "Petit groupe"],
        hint: "Un rythme progressif et encadré pour garder l'élan chaque semaine."
      };
    }

    return {
      title: "Football sans pression",
      tags: ["Collectif", "Gratuit", "Tous niveaux"],
      hint: "Une pratique conviviale orientée plaisir de jouer, sans jugement."
    };
  }, [energy, group]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-2 sm:items-center" role="dialog" aria-modal="true" aria-label="Matching sportif">
      <div className="w-full max-w-[390px] overflow-hidden rounded-2xl bg-white shadow-2xl">
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
                <Link
                  to="/evenements"
                  onClick={onClose}
                  className="flex h-12 flex-1 items-center justify-center rounded-[56px] bg-[#0760fc] text-base font-medium text-white"
                >
                  Voir le programme
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
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
