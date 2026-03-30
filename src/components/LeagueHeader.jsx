import { useQuery } from "@tanstack/react-query";
import { api, LEAGUES } from "../api/footballData";

export default function LeagueHeader({ code }) {
  const fallback = LEAGUES[code];

  const competitionQuery = useQuery({
    queryKey: ["competition", code],
    queryFn: () => api.competition(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  const name = competitionQuery.data?.name || fallback?.name || code;
  const area = competitionQuery.data?.area?.name || fallback?.country || "";
  const emblem = competitionQuery.data?.emblem;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {emblem ? (
            <img
              src={emblem}
              alt={`${name} emblem`}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <span className="text-3xl">{fallback?.flag || "🏟️"}</span>
          )}

          <div>
            <h1 className="text-3xl font-bold text-white">{name}</h1>
            <p className="text-slate-400">{area}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
