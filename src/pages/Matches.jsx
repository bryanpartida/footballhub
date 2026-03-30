import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import LeagueHeader from "../components/LeagueHeader";
import LeagueTabs from "../components/LeagueTabs";
import { format } from "date-fns";

export default function Matches() {
  const { code } = useParams();

  const [filters, setFilters] = useState({
    status: "SCHEDULED", // ALL | SCHEDULED | FINISHED
    matchday: "",
    dateFrom: "",
    dateTo: "",
    teamSearch: "",
  });

  const queryParams = useMemo(() => {
    const p = {};
    if (filters.status !== "ALL") p.status = filters.status;
    if (filters.matchday) p.matchday = filters.matchday;
    if (filters.dateFrom) p.dateFrom = filters.dateFrom;
    if (filters.dateTo) p.dateTo = filters.dateTo;
    return p;
  }, [filters]);

  // Matches
  const matchesQuery = useQuery({
    queryKey: ["matches", code, queryParams],
    queryFn: () => api.matches(code, queryParams),
    enabled: !!code,
  });

  // Teams list for crest lookup (in case matches don’t include crest)
  const teamsQuery = useQuery({
    queryKey: ["teams", code],
    queryFn: () => api.teams(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 30, // extra cache
  });

  const crestById = useMemo(() => {
    const map = new Map();
    (teamsQuery.data?.teams ?? []).forEach((t) => {
      map.set(t.id, t.crest || t.crestUrl);
    });
    return map;
  }, [teamsQuery.data]);

  const matches = matchesQuery.data?.matches ?? [];
  const filtered = matches.filter((m) => {
    if (!filters.teamSearch) return true;
    const q = filters.teamSearch.toLowerCase();
    return (
      m.homeTeam?.name?.toLowerCase().includes(q) ||
      m.awayTeam?.name?.toLowerCase().includes(q)
    );
  });

  const getCrest = (team) =>
    team?.crest || team?.crestUrl || crestById.get(team?.id);

  return (
    <div>
      <LeagueHeader code={code} />
      <LeagueTabs code={code} />

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-slate-400">Status</label>
            <select
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-md p-2"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="ALL">All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="FINISHED">Finished</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">Matchday</label>
            <input
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-md p-2"
              placeholder="e.g. 12"
              value={filters.matchday}
              onChange={(e) =>
                setFilters((f) => ({ ...f, matchday: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Date From</label>
            <input
              type="date"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-md p-2"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateFrom: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Date To</label>
            <input
              type="date"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-md p-2"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateTo: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Search Team</label>
            <input
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-md p-2"
              placeholder="Arsenal..."
              value={filters.teamSearch}
              onChange={(e) =>
                setFilters((f) => ({ ...f, teamSearch: e.target.value }))
              }
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3"></p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {matchesQuery.isLoading && (
          <div className="p-6 text-slate-300">Loading matches...</div>
        )}
        {matchesQuery.isError && (
          <div className="p-6 text-red-300">{matchesQuery.error.message}</div>
        )}

        {!matchesQuery.isLoading && !matchesQuery.isError && (
          <div className="divide-y divide-slate-800">
            {filtered.map((m) => {
              const utc = m.utcDate ? new Date(m.utcDate) : null;
              const dateLabel = utc ? format(utc, "MMM d, yyyy • HH:mm") : "—";
              const score =
                m.score?.fullTime?.home !== null &&
                m.score?.fullTime?.away !== null
                  ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
                  : "—";

              const homeCrest = getCrest(m.homeTeam);
              const awayCrest = getCrest(m.awayTeam);

              return (
                <div key={m.id} className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-400">{dateLabel}</div>
                    <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-200">
                      {m.status}
                    </div>
                  </div>

                  <div className="mt-2 grid md:grid-cols-3 gap-3 items-center">
                    <div className="text-white">
                      <Link
                        to={`/team/${m.homeTeam.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <img
                          src={homeCrest}
                          alt={`${m.homeTeam.name} crest`}
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <span>{m.homeTeam.name}</span>
                      </Link>
                    </div>

                    <div className="text-center text-white font-semibold">
                      {score}
                    </div>

                    <div className="text-white md:text-right">
                      <Link
                        to={`/team/${m.awayTeam.id}`}
                        className="flex items-center gap-3 md:justify-end hover:underline"
                      >
                        <img
                          src={awayCrest}
                          alt={`${m.awayTeam.name} crest`}
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <span>{m.awayTeam.name}</span>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/match/${m.id}`}
                      className="text-sm text-white hover:underline"
                    >
                      View Match →
                    </Link>
                  </div>
                </div>
              );
            })}

            {!filtered.length && (
              <div className="p-6 text-slate-300">No matches found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
