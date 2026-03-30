import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "../api/footballData";
import MatchdayCompanion from "../components/MatchdayCompanion";
import { generateMatchInsights } from "../features/insights/generateMatchInsights";

export default function MatchDetail() {
  const { matchId } = useParams();

  const matchQuery = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => api.match(matchId),
    enabled: !!matchId,
  });

  const match = matchQuery.data;
  const competitionCode = match?.competition?.code;
  const homeTeamId = match?.homeTeam?.id;
  const awayTeamId = match?.awayTeam?.id;

  const standingsQuery = useQuery({
    queryKey: ["standings", competitionCode],
    queryFn: () => api.standings(competitionCode),
    enabled: !!competitionCode,
    staleTime: 1000 * 60 * 10,
  });

  const homeMatchesQuery = useQuery({
    queryKey: ["teamMatches", homeTeamId, "recent"],
    queryFn: () =>
      api.teamMatches(homeTeamId, {
        status: "FINISHED",
        limit: 5,
      }),
    enabled: !!homeTeamId,
    staleTime: 1000 * 60 * 5,
  });

  const awayMatchesQuery = useQuery({
    queryKey: ["teamMatches", awayTeamId, "recent"],
    queryFn: () =>
      api.teamMatches(awayTeamId, {
        status: "FINISHED",
        limit: 5,
      }),
    enabled: !!awayTeamId,
    staleTime: 1000 * 60 * 5,
  });

  const standingsTable = standingsQuery.data?.standings?.[0]?.table ?? [];
  const homeRecentMatches = homeMatchesQuery.data?.matches ?? [];
  const awayRecentMatches = awayMatchesQuery.data?.matches ?? [];

  const insights = useMemo(() => {
    return generateMatchInsights({
      match,
      standingsTable,
      homeRecentMatches,
      awayRecentMatches,
    });
  }, [match, standingsTable, homeRecentMatches, awayRecentMatches]);

  const utc = match?.utcDate ? new Date(match.utcDate) : null;
  const dateLabel = utc ? format(utc, "MMM d, yyyy • HH:mm") : "—";

  const homeScore = match?.score?.fullTime?.home;
  const awayScore = match?.score?.fullTime?.away;

  const score =
    homeScore !== null &&
    homeScore !== undefined &&
    awayScore !== null &&
    awayScore !== undefined
      ? `${homeScore} - ${awayScore}`
      : "vs";

  const homeCrest = match?.homeTeam?.crest || match?.homeTeam?.crestUrl;
  const awayCrest = match?.awayTeam?.crest || match?.awayTeam?.crestUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {matchQuery.isLoading ? "Loading match..." : "Match Detail"}
          </h1>
          <p className="text-slate-400 mt-1">
            Context, form, and what this match means.
          </p>
        </div>

        <Link
          to={
            competitionCode ? `/league/${competitionCode}/matches` : "/leagues"
          }
          className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
        >
          Back to Matches
        </Link>
      </div>

      {matchQuery.isError && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-red-300">
          {matchQuery.error?.message || "Failed to load match."}
        </div>
      )}

      {match && (
        <>
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-800">
              <div className="text-xs text-slate-400">{dateLabel}</div>
              <div className="text-sm text-slate-500 mt-1">
                {match.competition?.name || "Competition"} • {match.status}
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-4 items-center">
                <Link
                  to={`/team/${match.homeTeam?.id}`}
                  className="flex items-center gap-3 text-white hover:underline"
                >
                  {homeCrest ? (
                    <img
                      src={homeCrest}
                      alt={`${match.homeTeam?.name} crest`}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                  <span className="text-lg font-semibold">
                    {match.homeTeam?.name}
                  </span>
                </Link>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{score}</div>
                  <div className="text-xs text-slate-400 mt-2">
                    Matchday {match.matchday || "—"}
                  </div>
                </div>

                <Link
                  to={`/team/${match.awayTeam?.id}`}
                  className="flex items-center justify-start md:justify-end gap-3 text-white hover:underline"
                >
                  <span className="text-lg font-semibold">
                    {match.awayTeam?.name}
                  </span>
                  {awayCrest ? (
                    <img
                      src={awayCrest}
                      alt={`${match.awayTeam?.name} crest`}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : null}
                </Link>
              </div>
            </div>
          </section>

          <MatchdayCompanion insights={insights} />

          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-800">
              <h2 className="text-white font-semibold">Three Things to Know</h2>
              <p className="text-xs text-slate-400 mt-1">
                A quick summary before kickoff or after the result.
              </p>
            </div>

            <div className="p-4 md:p-6">
              {insights.length ? (
                <ol className="space-y-3 list-decimal list-inside text-slate-200">
                  {insights.map((item, index) => (
                    <li
                      key={index}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-4"
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-400">
                  Match insights will appear here once enough context is
                  available.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
