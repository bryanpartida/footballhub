import { Link } from "react-router-dom";
import { LEAGUES } from "../api/footballData";
import { useCompetition } from "../hooks/useCompetition";

function LeagueEmblemSmall({ code, fallback }) {
  const q = useCompetition(code);
  const emblem = q.data?.emblem;

  return emblem ? (
    <img
      src={emblem}
      alt={`${q.data?.name || code} emblem`}
      className="w-12 h-12 object-contain"
      loading="lazy"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  ) : (
    <div className="text-5xl">{fallback}</div>
  );
}

export default function Leagues() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Choose a League</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.values(LEAGUES).map((l) => (
          <div
            key={l.code}
            className="bg-slate-900 border border-slate-800 rounded-xl p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <LeagueEmblemSmall code={l.code} fallback={l.flag} />
                <h2 className="text-2xl font-bold mt-3 text-white">{l.name}</h2>
                <p className="text-slate-400">{l.country}</p>
              </div>
              <Link
                to={`/league/${l.code}`}
                className="px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Open League
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
