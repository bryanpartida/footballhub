import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import LeagueHeader from "../components/LeagueHeader";
import LeagueTabs from "../components/LeagueTabs";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import { format } from "date-fns";

export default function LeagueOverview() {
  const { code } = useParams();

  const competitionQuery = useQuery({
    queryKey: ["competition", code],
    queryFn: () => api.competition(code),
    enabled: !!code,
  });

  // standings for Top 6
  const standingsQuery = useQuery({
    queryKey: ["standings", code],
    queryFn: () => api.standings(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 10,
  });

  // matches for Next 3
  const matchesQuery = useQuery({
    queryKey: ["matches", code, { status: "SCHEDULED" }],
    queryFn: () => api.matches(code, { status: "SCHEDULED" }),
    enabled: !!code,
    staleTime: 1000 * 60 * 5,
  });

  // teams for crest lookup fallback
  const teamsQuery = useQuery({
    queryKey: ["teams", code],
    queryFn: () => api.teams(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 30,
  });

  const seasonLabel = (() => {
    const start = competitionQuery.data?.currentSeason?.startDate; // "YYYY-MM-DD"
    const end = competitionQuery.data?.currentSeason?.endDate; // "YYYY-MM-DD"
    if (!start || !end) return "—";
    const startYear = start.slice(0, 4);
    const endYear = end.slice(0, 4);
    return `${startYear}/${endYear}`;
  })();

  const crestById = useMemo(() => {
    const map = new Map();
    (teamsQuery.data?.teams ?? []).forEach((t) => {
      map.set(t.id, t.crest || t.crestUrl);
    });
    return map;
  }, [teamsQuery.data]);

  const table = standingsQuery.data?.standings?.[0]?.table ?? [];
  const top6 = table.slice(0, 6);

  const scheduledMatches = matchesQuery.data?.matches ?? [];

  const next3 = useMemo(() => {
    // sort by utcDate and take first 3
    const copy = [...scheduledMatches].filter((m) => m.utcDate);
    copy.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    return copy.slice(0, 3);
  }, [scheduledMatches]);

  const getCrest = (teamObj) =>
    teamObj?.crest || teamObj?.crestUrl || crestById.get(teamObj?.id);

  if (!code) return null;

  return (
    <div>
      <LeagueHeader code={code} />
      <LeagueTabs code={code} />

      {/* Header card: season + buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        {competitionQuery.isLoading && (
          <p className="text-slate-300">Loading league info...</p>
        )}
        {competitionQuery.isError && (
          <p className="text-red-300">
            {competitionQuery.error.message || "Failed to load league info."}
          </p>
        )}
        {competitionQuery.data && (
          <div className="space-y-4">
            <p className="text-slate-300">
              <span className="text-slate-400">Season:</span> {seasonLabel}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                className="px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
                to={`/league/${code}/standings`}
              >
                View Standings
              </Link>
              <Link
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                to={`/league/${code}/matches`}
              >
                View Matches
              </Link>
              <Link
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                to={`/league/${code}/teams`}
              >
                View Teams
              </Link>
              <Link
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                to={`/trivia`}
              >
                Play Trivia
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Two boxes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 6 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-800">
            <h2 className="text-white font-semibold">Top 6</h2>
            <p className="text-xs text-slate-400">Current standings snapshot</p>
          </div>

          {standingsQuery.isLoading && (
            <div className="p-6 text-slate-300">Loading standings...</div>
          )}
          {standingsQuery.isError && (
            <div className="p-6 text-red-300">
              {standingsQuery.error.message}
            </div>
          )}

          {!standingsQuery.isLoading && !standingsQuery.isError && (
            <div className="divide-y divide-slate-800">
              {top6.map((row) => {
                const crest = row.team?.crest || crestById.get(row.team?.id);
                return (
                  <div key={row.team.id} className="p-4 md:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-slate-400 w-6">{row.position}</div>
                        <img
                          src={crest}
                          alt={`${row.team.name} crest`}
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <Link
                          to={`/team/${row.team.id}`}
                          className="text-white hover:underline truncate"
                        >
                          {row.team.name}
                        </Link>
                      </div>

                      <div className="text-sm text-slate-300 flex gap-4">
                        <div>
                          <span className="text-slate-500">Pts</span>{" "}
                          <span className="text-white font-semibold">
                            {row.points}
                          </span>
                        </div>
                        <div className="hidden sm:block">
                          <span className="text-slate-500">GD</span>{" "}
                          <span className="text-slate-200">
                            {row.goalDifference}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!top6.length && (
                <div className="p-6 text-slate-300">
                  No standings available.
                </div>
              )}
            </div>
          )}

          <div className="p-4 md:p-5 border-t border-slate-800">
            <Link
              to={`/league/${code}/standings`}
              className="text-sm text-white hover:underline"
            >
              View full standings →
            </Link>
          </div>
        </div>

        {/* Next 3 matches */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-800">
            <h2 className="text-white font-semibold">Next 3 Matches</h2>
            <p className="text-xs text-slate-400">
              Upcoming fixtures (soonest first)
            </p>
          </div>

          {matchesQuery.isLoading && (
            <div className="p-6 text-slate-300">
              Loading upcoming matches...
            </div>
          )}
          {matchesQuery.isError && (
            <div className="p-6 text-red-300">{matchesQuery.error.message}</div>
          )}

          {!matchesQuery.isLoading && !matchesQuery.isError && (
            <div className="divide-y divide-slate-800">
              {next3.map((m) => {
                const utc = m.utcDate ? new Date(m.utcDate) : null;
                const dateLabel = utc
                  ? format(utc, "MMM d, yyyy • HH:mm")
                  : "—";

                const homeCrest = getCrest(m.homeTeam);
                const awayCrest = getCrest(m.awayTeam);

                return (
                  <div key={m.id} className="p-4 md:p-5">
                    <div className="text-xs text-slate-400">{dateLabel}</div>

                    <div className="mt-2 grid grid-cols-3 items-center gap-3">
                      <Link
                        to={`/team/${m.homeTeam.id}`}
                        className="flex items-center gap-2 text-white hover:underline min-w-0"
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
                        <span className="truncate">{m.homeTeam.name}</span>
                      </Link>

                      <div className="text-center text-slate-300 text-sm">
                        vs
                      </div>

                      <Link
                        to={`/team/${m.awayTeam.id}`}
                        className="flex items-center gap-2 justify-end text-white hover:underline min-w-0"
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
                        <span className="truncate">{m.awayTeam.name}</span>
                      </Link>
                    </div>
                    <div className="mt-3 flex justify-end">
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

              {!next3.length && (
                <div className="p-6 text-slate-300">
                  No upcoming matches found.
                </div>
              )}
            </div>
          )}

          <div className="p-4 md:p-5 border-t border-slate-800">
            <Link
              to={`/league/${code}/matches`}
              className="text-sm text-white hover:underline"
            >
              View all matches →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
