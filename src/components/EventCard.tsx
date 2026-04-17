import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EventItem } from "../types/domain";

type EventCardProps = {
  event: EventItem;
  index?: number;
  onOpen?: (event: EventItem) => void;
  showIllustration?: boolean;
};

const palette = [
  {
    card: "bg-[#0760fc] text-white",
    button: "bg-[#3980fd]",
    deco: "/images/figma/program-card-blue.svg",
    meta: "text-[#cccccc]"
  },
  {
    card: "bg-[#8658f4] text-white",
    button: "bg-[#a17df6]",
    deco: "/images/figma/program-card-purple.svg",
    meta: "text-[#e7e7e7]"
  },
  {
    card: "bg-[#39e397] text-[#232325]",
    button: "bg-[#34cf89]",
    deco: "/images/figma/program-card-green.svg",
    meta: "text-[#3d3d40]"
  },
  {
    card: "bg-[#f8ef74] text-[#232325]",
    button: "bg-[#dec755]",
    deco: "/images/figma/program-card-yellow.svg",
    meta: "text-[#323234]"
  }
];

function EventCard({ event, index = 0, onOpen, showIllustration = true }: EventCardProps) {
  const color = palette[index % palette.length];
  const [illustrationVisible, setIllustrationVisible] = useState(true);
  const indexFallbackIllustration = useMemo(() => {
    const bySlot = [
      "/images/activities/yoga.png",
      "/images/activities/foot.png",
      "/images/activities/basket.png",
      "/images/activities/run.png"
    ];

    return bySlot[index % bySlot.length];
  }, [index]);

  const fallbackIllustration = useMemo(() => {
    const text = `${event.title} ${event.short_description}`.toLowerCase();

    if (text.includes("yoga")) return "/images/activities/yoga.png";
    if (text.includes("football") || text.includes("foot")) return "/images/activities/foot.png";
    if (text.includes("basket")) return "/images/activities/basket.png";
    if (text.includes("running") || text.includes("course") || text.includes("run")) return "/images/activities/run.png";

    return indexFallbackIllustration;
  }, [event.short_description, event.title, indexFallbackIllustration]);

  const illustrationSrc = event.cover_image || fallbackIllustration;
  const hasIllustration = Boolean(showIllustration && illustrationSrc && illustrationVisible);
  const illustrationLayout = useMemo(() => {
    const text = `${event.title} ${event.short_description}`.toLowerCase();

    if (text.includes("yoga")) {
      return {
        wrapClass: "absolute right-10 top-1/2 z-[2] h-[122px] w-[122px] -translate-y-[52%]",
        imageClass: "h-full w-full object-contain scale-[1.34] translate-y-[-2px]"
      };
    }

    if (text.includes("football") || text.includes("foot")) {
      return {
        wrapClass: "absolute right-7 top-1/2 z-[2] h-[126px] w-[142px] -translate-y-[40%]",
        imageClass: "h-full w-full object-contain scale-[1.32]"
      };
    }

    if (text.includes("basket")) {
      return {
        wrapClass: "absolute right-10 top-1/2 z-[2] h-[122px] w-[122px] -translate-y-[42%]",
        imageClass: "h-full w-full object-contain scale-[1.16]"
      };
    }

    if (text.includes("running") || text.includes("course") || text.includes("run")) {
      return {
        wrapClass: "absolute right-9 top-1/2 z-[2] h-[124px] w-[124px] -translate-y-[44%]",
        imageClass: "h-full w-full object-contain scale-[1.34]"
      };
    }

    return {
      wrapClass: "absolute right-10 top-1/2 z-[2] h-[120px] w-[120px] -translate-y-[44%]",
      imageClass: "h-full w-full object-contain scale-[1.2]"
    };
  }, [event.short_description, event.title]);

  return (
    <article
      className={`relative min-h-[166px] overflow-hidden rounded-[20px] px-4 pb-6 pt-8 ${color.card} ${onOpen ? "cursor-pointer" : ""}`}
      onClick={onOpen ? () => onOpen(event) : undefined}
    >
      <img src={color.deco} alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-[112px] w-[112px]" />
      {hasIllustration ? (
        <div className={`pointer-events-none ${illustrationLayout.wrapClass}`}>
          <img
            src={illustrationSrc ?? ""}
            alt=""
            aria-hidden="true"
            className={illustrationLayout.imageClass}
            onError={() => setIllustrationVisible(false)}
          />
        </div>
      ) : null}

      <h2 className="relative z-[3] max-w-[190px] text-[18px] font-medium leading-[1.2] tracking-[-0.01em]">{event.title}</h2>
      <p className={`relative z-[3] mt-1.5 max-w-[200px] text-xs leading-[1.5] ${color.meta}`}>{event.location}</p>

      {onOpen ? (
        <button
          type="button"
          onClick={(eventClick) => {
            eventClick.stopPropagation();
            onOpen(event);
          }}
          className={`absolute bottom-4 right-4 z-[4] inline-flex h-11 w-11 items-center justify-center rounded-full text-[22px] text-white ${color.button}`}
          aria-label={`Ouvrir ${event.title}`}
        >
          ↗
        </button>
      ) : (
        <Link
          to={`/evenements/${event.slug}`}
          className={`absolute bottom-4 right-4 z-[4] inline-flex h-11 w-11 items-center justify-center rounded-full text-[22px] text-white ${color.button}`}
          aria-label={`Voir ${event.title}`}
        >
          ↗
        </Link>
      )}
    </article>
  );
}

export default EventCard;
