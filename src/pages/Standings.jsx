import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, LEAGUES } from "../api/footballData";
import { useSelectedTeam } from "../hooks/useSelectedTeam";

export default function Standings() {
  const { selectedTeam } = useSelectedTeam();
  const [leagueCode, setLeagueCode] = useState(selectedTeam?.leagueCode || "PL");

  const standingsQuery = useQuery({
    queryKey: ["standings", leagueCode],
    queryFn: () => api.standings(leagueCode),
    enabled: !!leagueCode,
    staleTime: 1000 * 60 * 10,
  });

  const table = useMemo(() => standingsQuery.data?.standings?.[0]?.table || [], [standingsQuery.data]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">League tables</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Standings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Keep this page intentionally clean. It should support the selected-team experience, not compete with it.
            </p>
          </div>

          {selectedTeam ? (
            <Link to={`/club/${selectedTeam.id}`} className="text-sm font-medium text-white hover:text-slate-200">
              Back to {selectedTeam.shortName || selectedTeam.name} →
            </Link>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          {Object.values(LEAGUES).map((league) => (
            <button
              key={league.code}
              type="button"
              onClick={() => setLeagueCode(league.code)}
              className={`rounded-full border px-4 py-2 text-sm transition ${leagueCode === league.code
                  ? "border-white bg-white text-slate-950"
                  : "border-white/10 bg-white/5 text-white hover:border-white/20"
                }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-black/10 backdrop-blur-xl">
        {standingsQuery.isLoading ? <div className="p-6 text-slate-300">Loading standings...</div> : null}
        {standingsQuery.isError ? <div className="p-6 text-red-300">{standingsQuery.error?.message || "Failed to load standings."}</div> : null}

        {!standingsQuery.isLoading && !standingsQuery.isError ? (
          <div>
            <div className="grid grid-cols-[72px_1fr_90px_90px] gap-3 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">
              <div>Pos</div>
              <div>Club</div>
              <div>Pts</div>
              <div>GD</div>
            </div>

            <div className="divide-y divide-white/8">
              {table.map((row) => (
                <div key={row.team.id} className="grid grid-cols-[72px_1fr_90px_90px] items-center gap-3 px-6 py-4 text-sm">
                  <div className="font-medium text-white">{row.position}</div>
                  <div className="flex min-w-0 items-center gap-3">
                    {row.team?.crest ? <img src={row.team.crest} alt={`${row.team.name} crest`} className="h-6 w-6 object-contain" /> : null}
                    <div className="truncate text-slate-200">{row.team.name}</div>
                  </div>
                  <div className="text-slate-100">{row.points}</div>
                  <div className="text-slate-300">{row.goalDifference}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
