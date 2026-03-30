import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";
import LeagueHeader from "../components/LeagueHeader";
import LeagueTabs from "../components/LeagueTabs";
import { useState } from "react";

export default function Teams() {
  const { code } = useParams();
  const [q, setQ] = useState("");

  const teamsQuery = useQuery({
    queryKey: ["teams", code],
    queryFn: () => api.teams(code),
    enabled: !!code,
  });

  const teams = teamsQuery.data?.teams ?? [];
  const filtered = teams.filter((t) =>
    q ? t.name.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <LeagueHeader code={code} />
      <LeagueTabs code={code} />

      <div className="mb-4">
        <input
          className="w-full md:w-96 bg-slate-950 border border-slate-800 rounded-md p-2"
          placeholder="Search team..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {teamsQuery.isLoading && (
          <p className="text-slate-300">Loading teams...</p>
        )}
        {teamsQuery.isError && (
          <p className="text-red-300">{teamsQuery.error.message}</p>
        )}

        {!teamsQuery.isLoading && !teamsQuery.isError && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => {
              const crest = t.crest || t.crestUrl;

              return (
                <Link
                  key={t.id}
                  to={`/team/${t.id}`}
                  className="border border-slate-800 rounded-lg p-4 hover:bg-slate-950 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={crest}
                      alt={`${t.name} crest`}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 truncate">
                        {t.venue || ""}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!teamsQuery.isLoading && !teamsQuery.isError && !filtered.length && (
          <p className="text-slate-300">No teams found.</p>
        )}
      </div>
    </div>
  );
}
