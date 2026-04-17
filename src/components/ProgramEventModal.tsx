import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchRegistrationByEvent, registerToEvent } from "../services/registrations";
import { EventItem, EventRegistration } from "../types/domain";
import { formatDateTime } from "../utils/date";

type ProgramEventModalProps = {
  event: EventItem | null;
  accentColor?: string;
  onClose: () => void;
};

function ProgramEventModal({ event, accentColor = "#0760fc", onClose }: ProgramEventModalProps) {
  const { isAuthenticated, session } = useAuth();
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!event) {
      setRegistration(null);
      setMessage(null);
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    function onEscape(eventKey: KeyboardEvent) {
      if (eventKey.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [event, onClose]);

  useEffect(() => {
    let active = true;

    async function loadRegistrationState() {
      if (!event || !isAuthenticated || !session?.user.id) {
        setRegistration(null);
        return;
      }

      setIsLoadingRegistration(true);
      try {
        const data = await fetchRegistrationByEvent(session.user.id, event.id);
        if (!active) return;
        setRegistration(data);
      } finally {
        if (active) setIsLoadingRegistration(false);
      }
    }

    void loadRegistrationState();

    return () => {
      active = false;
    };
  }, [event, isAuthenticated, session?.user.id]);

  if (!event) return null;
  const selectedEvent = event;

  async function handleRegister() {
    if (!session?.user.id) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const next = await registerToEvent(session.user.id, selectedEvent.id);
      setRegistration(next);
      setMessage("Inscription confirmée.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const alreadyRegistered = registration?.registration_status === "registered";

  return (
    <div className="fixed inset-0 z-50 bg-black/50" role="dialog" aria-modal="true" aria-label={`Détails ${selectedEvent.title}`}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default" />

      <div className="absolute bottom-0 left-1/2 w-full max-w-[390px] -translate-x-1/2 rounded-t-[14px] bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-20 rounded-full bg-[#ececf1]" />

        <p className="text-base font-medium tracking-[-0.02em] text-[#3f7dff]">À propos de l&apos;activité</p>
        <h2 className="mt-1 text-[32px] font-semibold leading-tight tracking-[-0.02em] text-black">{selectedEvent.title}</h2>

        <div className="mt-4 space-y-3 text-sm text-[#232325]">
          <InfoRow label="Quand" value={`${formatDateTime(selectedEvent.start_date)} - ${formatDateTime(selectedEvent.end_date)}`} />
          <InfoRow label="Lieu" value={selectedEvent.location} />
          <InfoRow
            label="Équipement"
            value="Prévois une tenue souple et de l'eau. Le tapis est fourni."
          />
          <InfoRow label="Association" value="Up Sport! Paris Nord" />
        </div>

        <div className="mt-3 border-t border-[#e4e4e8] pt-3">
          <p className="text-base text-[#474749]">{selectedEvent.short_description || "Accessible à tous. Débutants bienvenus, sans pression."}</p>
        </div>

        {message ? <p className="mt-2 text-xs text-[#4f4f52]">{message}</p> : null}

        <div className="mt-4">
          {!isAuthenticated ? (
            <Link
              to="/connexion"
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center rounded-[56px] text-base font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              Se connecter pour m&apos;inscrire
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleRegister}
              disabled={isSubmitting || isLoadingRegistration || alreadyRegistered}
              className="flex h-12 w-full items-center justify-center rounded-[56px] text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {alreadyRegistered ? "Déjà inscrit" : isSubmitting ? "Inscription..." : "M’inscrire"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs text-[#7a7a80]">{label}</p>
      <p className="mt-1 text-base text-[#232325]">{value}</p>
    </div>
  );
}

export default ProgramEventModal;
