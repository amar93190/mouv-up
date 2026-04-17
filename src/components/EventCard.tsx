import { Link } from "react-router-dom";
import { EventItem } from "../types/domain";

type EventCardProps = {
  event: EventItem;
  index?: number;
  onOpen?: (event: EventItem) => void;
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

function EventCard({ event, index = 0, onOpen }: EventCardProps) {
  const color = palette[index % palette.length];

  return (
    <article
      className={`relative overflow-hidden rounded-[20px] px-4 pb-6 pt-8 ${color.card} ${onOpen ? "cursor-pointer" : ""}`}
      onClick={onOpen ? () => onOpen(event) : undefined}
    >
      <img src={color.deco} alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-[112px] w-[112px]" />

      <h2 className="max-w-[152px] text-[18px] font-medium leading-[1.2] tracking-[-0.01em]">{event.title}</h2>
      <p className={`mt-1.5 max-w-[180px] text-xs leading-[1.5] ${color.meta}`}>{event.location}</p>

      {onOpen ? (
        <button
          type="button"
          onClick={(eventClick) => {
            eventClick.stopPropagation();
            onOpen(event);
          }}
          className={`absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[22px] text-white ${color.button}`}
          aria-label={`Ouvrir ${event.title}`}
        >
          ↗
        </button>
      ) : (
        <Link
          to={`/evenements/${event.slug}`}
          className={`absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[22px] text-white ${color.button}`}
          aria-label={`Voir ${event.title}`}
        >
          ↗
        </Link>
      )}
    </article>
  );
}

export default EventCard;
