import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import LeagueHeader from "../components/LeagueHeader";
import LeagueTabs from "../components/LeagueTabs";

export default function Standings() {
  const { code } = useParams();

  const standingsQuery = useQuery({
    queryKey: ["standings", code],
    queryFn: () => api.standings(code),
    enabled: !!code,
  });

  const table = standingsQuery.data?.standings?.[0]?.table ?? [];

  //   console.log(table[0]?.team);

  return (
    <div>
      <LeagueHeader code={code} />
      <LeagueTabs code={code} />

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {standingsQuery.isLoading && (
          <div className="p-6 text-slate-300">Loading standings...</div>
        )}
        {standingsQuery.isError && (
          <div className="p-6 text-red-300">
            {standingsQuery.error.message || "Failed to load standings."}
          </div>
        )}

        {!!table.length && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr className="text-slate-300 text-sm">
                  <th className="text-left px-4 md:px-6 py-4">Pos</th>
                  <th className="text-left px-4 md:px-6 py-4">Team</th>
                  <th className="text-center px-2 md:px-3 py-4">P</th>
                  <th className="text-center px-2 md:px-3 py-4">W</th>
                  <th className="text-center px-2 md:px-3 py-4">D</th>
                  <th className="text-center px-2 md:px-3 py-4">L</th>
                  <th className="text-center px-2 md:px-3 py-4">GD</th>
                  <th className="text-center px-2 md:px-3 py-4">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr
                    key={row.team.id}
                    className="border-t border-slate-800 hover:bg-slate-950 transition"
                  >
                    <td className="px-4 md:px-6 py-4">{row.position}</td>
                    <td className="px-4 md:px-6 py-4">
                      <Link
                        to={`/team/${row.team.id}`}
                        className="flex items-center gap-3 text-white hover:underline"
                      >
                        <img
                          src={row.team.crest || row.team.crestUrl}
                          alt={`${row.team.name} crest`}
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"; // hide broken image
                          }}
                        />
                        <span>{row.team.name}</span>
                      </Link>
                    </td>
                    <td className="text-center px-2 md:px-3 py-4">
                      {row.playedGames}
                    </td>
                    <td className="text-center px-2 md:px-3 py-4">{row.won}</td>
                    <td className="text-center px-2 md:px-3 py-4">
                      {row.draw}
                    </td>
                    <td className="text-center px-2 md:px-3 py-4">
                      {row.lost}
                    </td>
                    <td className="text-center px-2 md:px-3 py-4">
                      {row.goalDifference}
                    </td>
                    <td className="text-center px-2 md:px-3 py-4 font-semibold text-white">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!standingsQuery.isLoading &&
          !standingsQuery.isError &&
          !table.length && (
            <div className="p-6 text-slate-300">No standings available.</div>
          )}
      </div>
    </div>
  );
}
