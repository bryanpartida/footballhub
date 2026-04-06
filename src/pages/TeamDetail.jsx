import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import { format } from "date-fns";
import FavoriteButton from "../components/FavoriteButton";
import { useFavorites } from "../features/favorites/useFavorites";

function TeamMiniBadge({ team, align = "left" }) {
  const crest = team?.crest || team?.crestUrl;

  return (
    <div
      className={`flex items-center gap-3 min-w-0 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      {align === "right" ? (
        <>
          <div className="min-w-0">
            <div className="text-white truncate text-sm md:text-base">
              {team?.name || "—"}
            </div>
          </div>

          {crest ? (
            <img
              src={crest}
              alt={`${team?.name || "Team"} crest`}
              className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
          )}
        </>
      ) : (
        <>
          {crest ? (
            <img
              src={crest}
              alt={`${team?.name || "Team"} crest`}
              className="w-7 h-7 md:w-8 md:h-8 object-contain shrink-0"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
          )}

          <div className="min-w-0">
            <div className="text-white truncate text-sm md:text-base">
              {team?.name || "—"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TeamDetail() {
  const { teamId } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();

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
  const favorite = team ? isFavorite(team.id) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

        <div className="flex items-center gap-3">
          {team && (
            <FavoriteButton
              isActive={favorite}
              onClick={() => toggleFavorite(team.id)}
            />
          )}

          <Link
            to="/leagues"
            className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
          >
            Back to Leagues
          </Link>
        </div>
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
                <a href={team.website || "#"} target="_blank" rel="noreferrer">
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
          <p className="text-xs text-slate-400">
            Showing up to 10 matches · click a match to view details
          </p>
        </div>

        {matchesQuery.isLoading && (
          <div className="p-6 text-slate-300">Loading matches...</div>
        )}

        {!matchesQuery.isLoading && !matchesQuery.isError && (
          <div className="divide-y divide-slate-800">
            {matches.map((m) => {
              const utc = m.utcDate ? new Date(m.utcDate) : null;
              const dateLabel = utc ? format(utc, "MMM d, yyyy") : "—";

              const homeScore = m.score?.fullTime?.home;
              const awayScore = m.score?.fullTime?.away;

              const score =
                homeScore !== null &&
                homeScore !== undefined &&
                awayScore !== null &&
                awayScore !== undefined
                  ? `${homeScore} - ${awayScore}`
                  : "vs";

              return (
                <Link
                  key={m.id}
                  to={`/match/${m.id}`}
                  className="block p-4 md:p-6 hover:bg-slate-950 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">{dateLabel}</div>
                    <div className="text-xs text-slate-500">{m.status}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <TeamMiniBadge team={m.homeTeam} align="left" />

                    <div className="text-center text-white font-semibold text-sm md:text-base">
                      {score}
                    </div>

                    <TeamMiniBadge team={m.awayTeam} align="right" />
                  </div>
                </Link>
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
