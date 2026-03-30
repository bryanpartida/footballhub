import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import { format } from "date-fns";

export default function TeamDetail() {
  const { teamId } = useParams();

  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.team(teamId),
    enabled: !!teamId,
  });

  const matchesQuery = useQuery({
    queryKey: ["teamMatches", teamId],
    queryFn: () => api.teamMatches(teamId, { limit: 10 }),
    enabled: !!teamId,
  });

  const team = teamQuery.data;
  const matches = matchesQuery.data?.matches ?? [];

  const crest = team?.crest || team?.crestUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {team && (
            <img
              src={crest}
              alt={`${team.name} crest`}
              className="w-10 h-10 object-contain"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">
              {teamQuery.isLoading ? "Loading team..." : team?.name || "Team"}
            </h1>
            {team && (
              <p className="text-slate-400">
                {team.area?.name || ""} {team.venue ? `• ${team.venue}` : ""}
              </p>
            )}
          </div>
        </div>

        <Link
          to="/leagues"
          className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
        >
          Back to Leagues
        </Link>
      </div>

      {(teamQuery.isError || matchesQuery.isError) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-red-300">
          {teamQuery.error?.message || matchesQuery.error?.message || "Error"}
        </div>
      )}

      {team && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Short name</div>
              <div className="text-white">{team.shortName || "—"}</div>
            </div>
            <div>
              <div className="text-slate-400">Website</div>
              <div className="text-white break-all hover:underline hover:cursor-pointer">
                <a href={team.website || "—"} target="_blank" rel="">
                  {team.website || "—"}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold">
            Recent / Upcoming Matches
          </h2>
          <p className="text-xs text-slate-400">Showing up to 10 matches</p>
        </div>

        {matchesQuery.isLoading && (
          <div className="p-6 text-slate-300">Loading matches...</div>
        )}

        {!matchesQuery.isLoading && !matchesQuery.isError && (
          <div className="divide-y divide-slate-800">
            {matches.map((m) => {
              const utc = m.utcDate ? new Date(m.utcDate) : null;
              const dateLabel = utc ? format(utc, "MMM d, yyyy") : "—";
              const score =
                m.score?.fullTime?.home !== null &&
                m.score?.fullTime?.away !== null
                  ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
                  : "—";

              return (
                <div key={m.id} className="p-4 md:p-6">
                  <div className="text-xs text-slate-400">{dateLabel}</div>
                  <div className="mt-1 grid md:grid-cols-3 gap-3 items-center">
                    <div className="text-white">{m.homeTeam?.name}</div>
                    <div className="text-center text-white font-semibold">
                      {score}{" "}
                      <span className="text-xs text-slate-400">
                        ({m.status})
                      </span>
                    </div>
                    <div className="text-white md:text-right">
                      {m.awayTeam?.name}
                    </div>
                  </div>
                </div>
              );
            })}

            {!matches.length && (
              <div className="p-6 text-slate-300">No matches available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
