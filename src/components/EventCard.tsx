import { Link } from "react-router-dom";
import { EventItem } from "../types/domain";
import { formatDateTime } from "../utils/date";

type EventCardProps = {
  event: EventItem;
  index?: number;
};

const palette = [
  "from-[#1f66e5] to-[#2f7dff] text-white",
  "from-[#7e56df] to-[#9a70ff] text-white",
  "from-[#39d197] to-[#4de0ae] text-[#10231d]",
  "from-[#e4de69] to-[#efe67e] text-[#282812]"
];

function EventCard({ event, index = 0 }: EventCardProps) {
  const color = palette[index % palette.length];

  return (
    <article className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${color} p-5`}>
      <h2 className="max-w-[220px] text-[31px] font-semibold leading-tight">{event.title}</h2>
      <p className="mt-2 max-w-[240px] text-sm opacity-90">{event.location}</p>
      <p className="text-sm opacity-90">{formatDateTime(event.start_date)}</p>
      <Link
        to={`/evenements/${event.slug}`}
        className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/15 text-2xl text-white"
      >
        ↗
      </Link>
    </article>
  );
}

export default EventCard;
