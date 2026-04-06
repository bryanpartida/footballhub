import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { Check, ShieldQuestion, Star } from "lucide-react";
import { api, LEAGUES } from "../api/footballData";
import { useFavorites } from "../features/favorites/useFavorites";
import { setFavorites } from "../features/favorites/favoritesStore";
import logo from "../logo/footballhub-logo.png";

const MAX_FAVORITES = 3;

function leagueNameFromCode(code) {
  return LEAGUES[code]?.name || code;
}

function TeamCard({ team, selected, disabled, onToggle, leagueCode }) {
  const crest = team?.crest || team?.crestUrl;

  return (
    <button
      type="button"
      onClick={() => onToggle(team.id)}
      disabled={disabled}
      className={`text-left rounded-xl border p-4 transition ${
        selected
          ? "border-amber-400 bg-amber-400/10"
          : "border-slate-800 bg-slate-900 hover:bg-slate-950"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {crest ? (
            <img
              src={crest}
              alt={`${team.name} crest`}
              className="w-10 h-10 object-contain shrink-0"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
          )}

          <div className="min-w-0">
            <div className="text-white font-semibold truncate">{team.name}</div>
            <div className="text-xs text-slate-400 mt-1">
              {leagueNameFromCode(leagueCode)}
            </div>
          </div>
        </div>

        <div
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
            selected
              ? "border-amber-400 bg-amber-400 text-slate-950"
              : "border-slate-700 text-transparent"
          }`}
        >
          <Check className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}

export default function SelectFavorites() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const [selected, setSelected] = useState(() =>
    favorites.slice(0, MAX_FAVORITES),
  );

  const leagueQueries = useQueries({
    queries: Object.values(LEAGUES).map((league) => ({
      queryKey: ["teams", league.code, "favorites-onboarding"],
      queryFn: () => api.teams(league.code),
      staleTime: 1000 * 60 * 10,
    })),
  });

  const isLoading = leagueQueries.some((q) => q.isLoading);
  const isError = leagueQueries.some((q) => q.isError);
  const errorMessage =
    leagueQueries.find((q) => q.error)?.error?.message ||
    "Failed to load teams.";

  const teamsByLeague = useMemo(() => {
    const result = {};

    Object.values(LEAGUES).forEach((league, index) => {
      const teams = leagueQueries[index]?.data?.teams ?? [];
      result[league.code] = [...teams].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    });

    return result;
  }, [leagueQueries]);

  const selectedCount = selected.length;

  function toggleSelection(teamId) {
    const numericId = Number(teamId);

    setSelected((prev) => {
      if (prev.includes(numericId)) {
        return prev.filter((id) => id !== numericId);
      }

      if (prev.length >= MAX_FAVORITES) {
        return prev;
      }

      return [...prev, numericId];
    });
  }

  function handleConfirm() {
    if (!selected.length) return;
    setFavorites(selected);
    navigate("/", { replace: true });
  }

  return (
    <div className="space-y-8">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="FootballHub logo"
                className="w-14 h-14 object-contain"
              />
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                FootballHub
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Pick your favorite teams
            </h1>

            <p className="text-slate-400 max-w-2xl text-base md:text-lg">
              Select up to 3 teams to personalize your homepage with matchday
              context, upcoming fixtures, and tailored storylines.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 min-w-[240px]">
            <div className="text-slate-400 text-xs uppercase tracking-wide">
              Selected
            </div>
            <div className="text-3xl font-bold text-white mt-2">
              {selectedCount} of {MAX_FAVORITES}
            </div>
            <p className="text-slate-400 text-sm mt-3">
              Your picks will drive the homepage experience and the “What to
              Know Today” briefing.
            </p>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse"
            >
              <div className="h-12 bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-red-300">
          {errorMessage}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {Object.values(LEAGUES).map((league) => {
            const teams = teamsByLeague[league.code] || [];

            return (
              <section key={league.code} className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {league.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {league.country}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => {
                    const selectedAlready = selected.includes(Number(team.id));
                    const disabled =
                      !selectedAlready && selected.length >= MAX_FAVORITES;

                    return (
                      <TeamCard
                        key={team.id}
                        team={team}
                        leagueCode={league.code}
                        selected={selectedAlready}
                        disabled={disabled}
                        onToggle={toggleSelection}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div className="sticky bottom-4">
            <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-300 mt-0.5" />
                <div>
                  <div className="text-white font-semibold">
                    Ready to personalize FootballHub?
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Choose at least 1 team to continue. You can always change
                    them later.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/leagues"
                  className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                >
                  Browse leagues first
                </Link>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!selected.length}
                  className={`px-5 py-2 rounded-md font-semibold ${
                    selected.length
                      ? "bg-white text-slate-900 hover:opacity-90"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Confirm favorites
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!isLoading &&
        !isError &&
        !Object.values(teamsByLeague).some((teams) => teams.length) && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <ShieldQuestion className="w-5 h-5 text-slate-300" />
              <h3 className="text-white font-semibold">No teams found</h3>
            </div>
            <p className="text-slate-400 text-sm mt-3">
              The team lists could not be populated right now. Try refreshing
              the page.
            </p>
          </div>
        )}
    </div>
  );
}
