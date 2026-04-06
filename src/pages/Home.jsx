import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import {
  Trophy,
  Calendar,
  Users,
  Brain,
  Star,
  ChevronRight,
} from "lucide-react";
import { LEAGUES } from "../api/footballData";
import { useCompetition } from "../hooks/useCompetition";
import { useFavorites } from "../features/favorites/useFavorites";
import logo from "../logo/footballhub-logo.png";
import TodayInsightsGrid from "../components/TodayInsightsGrid";
import { generateTodayInsights } from "../features/insights/generateTodayInsights";

const API_BASE = "/api";

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    sp.set(key, value);
  });
  return sp.toString();
}

async function apiGet(path, params = {}) {
  const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN;
  const qs = buildQuery(params);
  const url = `${API_BASE}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: token
      ? {
          "X-Auth-Token": token,
        }
      : undefined,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

function formatTime(dateStr) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function shortTeamName(team) {
  return team?.shortName || team?.tla || team?.name || "Team";
}

function teamLogo(team) {
  return team?.crest || team?.crestUrl || null;
}

function toApiDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(daysAhead = 14) {
  const today = new Date();
  const end = new Date();
  end.setDate(today.getDate() + daysAhead);

  return {
    dateFrom: toApiDate(today),
    dateTo: toApiDate(end),
  };
}

async function getTeam(teamId) {
  return apiGet(`/teams/${teamId}`);
}

async function getTeamMatches(teamId) {
  const { dateFrom, dateTo } = getDateRange(14);
  return apiGet(`/teams/${teamId}/matches`, {
    status: "SCHEDULED",
    dateFrom,
    dateTo,
  });
}

async function getCompetitionMatches(code) {
  const { dateFrom, dateTo } = getDateRange(14);
  return apiGet(`/competitions/${code}/matches`, {
    status: "SCHEDULED",
    dateFrom,
    dateTo,
  });
}

async function getFinishedTeamMatches(teamId) {
  return apiGet(`/teams/${teamId}/matches`, {
    status: "FINISHED",
    limit: 5,
  });
}

async function getCompetitionStandings(code) {
  return apiGet(`/competitions/${code}/standings`);
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function EmptyState({ title, desc, action }) {
  return (
    <DashboardCard>
      <div className="space-y-3">
        <h3 className="text-white font-semibold">{title}</h3>
        <p className="text-slate-400 text-sm max-w-xl">{desc}</p>
        {action}
      </div>
    </DashboardCard>
  );
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <DashboardCard>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-slate-200" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm">{desc}</p>
    </DashboardCard>
  );
}

function LeagueEmblem({ code, fallback }) {
  const q = useCompetition(code);
  const emblem = q.data?.emblem;

  return emblem ? (
    <img
      src={emblem}
      alt={`${q.data?.name || code} emblem`}
      className="w-16 h-16 object-contain mx-auto"
      loading="lazy"
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  ) : (
    <div className="text-6xl">{fallback}</div>
  );
}

function LeagueCard({ league }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-600 transition">
      <div className="text-center space-y-3">
        <LeagueEmblem code={league.code} fallback={league.flag} />
        <p className="text-slate-400">{league.country}</p>
        <Link
          to={`/league/${league.code}`}
          className="inline-block mt-2 px-5 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
        >
          View League
        </Link>
      </div>
    </div>
  );
}

function TeamBadge({ team }) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      {teamLogo(team) ? (
        <img
          src={teamLogo(team)}
          alt={team?.name || "Team crest"}
          className="w-10 h-10 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
      )}

      <div className="text-xs text-slate-300 mt-2 leading-tight line-clamp-2">
        {shortTeamName(team)}
      </div>
    </div>
  );
}

function FavoriteTeamCard({ team }) {
  const competitions =
    team?.runningCompetitions
      ?.slice(0, 2)
      .map((c) => c.name)
      .join(" • ") ||
    team?.area?.name ||
    "Club";

  return (
    <Link
      to={`/team/${team.id}`}
      className="block bg-slate-950 border border-slate-800 rounded-lg p-4 hover:bg-slate-900 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            Favorite Team
          </div>

          <div className="flex items-center gap-3 mt-3">
            {teamLogo(team) ? (
              <img
                src={teamLogo(team)}
                alt={team.name}
                className="w-12 h-12 object-contain shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
            )}

            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{team.name}</h3>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {competitions}
              </p>
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
      </div>
    </Link>
  );
}

function MatchMiniCard({ match }) {
  const competitionName = match?.competition?.name || "Upcoming Match";

  return (
    <Link
      to={`/match/${match.id}`}
      className="block bg-slate-950 border border-slate-800 rounded-lg p-4 hover:bg-slate-900 hover:border-slate-700 transition"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-3">
        <span className="truncate">{competitionName}</span>
        <span className="shrink-0">
          {formatDate(match.utcDate)} · {formatTime(match.utcDate)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <TeamBadge team={match.homeTeam} />
        <div className="text-white text-xs font-semibold pt-3">vs</div>
        <TeamBadge team={match.awayTeam} />
      </div>
    </Link>
  );
}

function PlaceholderInsightCard({ title, desc }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm mt-2">{desc}</p>
    </div>
  );
}

function dedupeMatches(matches) {
  const seen = new Set();

  return matches.filter((match) => {
    const key =
      match?.id ||
      `${match?.homeTeam?.id}-${match?.awayTeam?.id}-${match?.utcDate}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function Home() {
  const { favorites } = useFavorites();
  const leagueList = Object.values(LEAGUES);

  const favoriteTeamQueries = useQueries({
    queries: favorites.map((teamId) => ({
      queryKey: ["team", teamId],
      queryFn: () => getTeam(teamId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const favoriteMatchQueries = useQueries({
    queries: favorites.map((teamId) => ({
      queryKey: ["team-home-matches", teamId],
      queryFn: () => getTeamMatches(teamId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const competitionMatchQueries = useQueries({
    queries: leagueList.map((league) => ({
      queryKey: ["competition-home-matches", league.code],
      queryFn: () => getCompetitionMatches(league.code),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const favoriteFinishedMatchQueries = useQueries({
    queries: favorites.map((teamId) => ({
      queryKey: ["team-finished-matches", teamId],
      queryFn: () => getFinishedTeamMatches(teamId),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const standingsQueries = useQueries({
    queries: leagueList.map((league) => ({
      queryKey: ["home-standings", league.code],
      queryFn: () => getCompetitionStandings(league.code),
      staleTime: 1000 * 60 * 10,
    })),
  });

  const favoriteTeams = useMemo(
    () =>
      favoriteTeamQueries
        .map((q) => q.data)
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [favoriteTeamQueries],
  );

  const favoriteUpcomingMatches = useMemo(() => {
    const perTeamMatches = favoriteMatchQueries.flatMap((q) => {
      const matches = (q.data?.matches || [])
        .slice()
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
        .slice(0, 2);

      return matches;
    });

    return dedupeMatches(perTeamMatches).sort(
      (a, b) => new Date(a.utcDate) - new Date(b.utcDate),
    );
  }, [favoriteMatchQueries]);

  const leagueUpcomingMatches = useMemo(() => {
    const matches = competitionMatchQueries
      .flatMap((q) => {
        const nextMatch = q.data?.matches?.[0];
        return nextMatch ? [nextMatch] : [];
      })
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    return dedupeMatches(matches);
  }, [competitionMatchQueries]);

  const matchesToWatch = useMemo(() => {
    if (!favorites.length) {
      return dedupeMatches(leagueUpcomingMatches).slice(0, 5);
    }

    const favoriteSet = dedupeMatches(favoriteUpcomingMatches)
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      .slice(0, 4);
    const filler = dedupeMatches(leagueUpcomingMatches).filter(
      (leagueMatch) =>
        !favoriteSet.some((favMatch) => favMatch.id === leagueMatch.id),
    );

    return [...favoriteSet, ...filler].slice(0, 5);
  }, [favorites.length, favoriteUpcomingMatches, leagueUpcomingMatches]);

  const scheduledMatchesByTeam = useMemo(() => {
    const map = new Map();

    favorites.forEach((teamId, index) => {
      const matches = (favoriteMatchQueries[index]?.data?.matches || [])
        .slice()
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

      map.set(Number(teamId), matches);
    });

    return map;
  }, [favorites, favoriteMatchQueries]);

  const finishedMatchesByTeam = useMemo(() => {
    const map = new Map();

    favorites.forEach((teamId, index) => {
      const matches = (favoriteFinishedMatchQueries[index]?.data?.matches || [])
        .slice()
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

      map.set(Number(teamId), matches);
    });

    return map;
  }, [favorites, favoriteFinishedMatchQueries]);

  const standingsTablesByLeague = useMemo(() => {
    const map = new Map();

    leagueList.forEach((league, index) => {
      map.set(
        league.code,
        standingsQueries[index]?.data?.standings?.[0]?.table ?? [],
      );
    });

    return map;
  }, [leagueList, standingsQueries]);

  const todayInsights = useMemo(() => {
    return generateTodayInsights({
      favoriteTeams,
      scheduledMatchesByTeam,
      finishedMatchesByTeam,
      standingsTablesByLeague,
      leagueMetaByCode: LEAGUES,
    });
  }, [
    favoriteTeams,
    scheduledMatchesByTeam,
    finishedMatchesByTeam,
    standingsTablesByLeague,
  ]);

  const teamsLoading =
    favorites.length > 0 &&
    favoriteTeamQueries.some((q) => q.isLoading || q.isFetching);

  const matchesLoading =
    competitionMatchQueries.some((q) => q.isLoading || q.isFetching) ||
    favoriteMatchQueries.some((q) => q.isLoading || q.isFetching);

  const todayInsightsLoading =
    favorites.length > 0 &&
    (favoriteTeamQueries.some((q) => q.isLoading || q.isFetching) ||
      favoriteMatchQueries.some((q) => q.isLoading || q.isFetching) ||
      favoriteFinishedMatchQueries.some((q) => q.isLoading || q.isFetching) ||
      standingsQueries.some((q) => q.isLoading || q.isFetching));

  return (
    <div className="space-y-10">
      <section className="py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="FootballHub logo"
                  className="w-14 h-14 object-contain drop-shadow"
                />
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  FootballHub
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Your smart football companion
              </h1>

              <p className="text-slate-400 max-w-2xl text-base md:text-lg">
                Understand what’s happening, why it matters, what to pay
                attention to, and what might happen next across leagues, teams,
                and matches.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/leagues"
                  className="px-5 py-2.5 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
                >
                  Explore Leagues
                </Link>
                <Link
                  to="/trivia"
                  className="px-5 py-2.5 rounded-md bg-slate-800 text-white font-semibold hover:bg-slate-700"
                >
                  Play Trivia
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 min-w-[260px]">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wide">
                  Focus
                </div>
                <div className="text-white font-semibold mt-2">
                  Match context
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wide">
                  Goal
                </div>
                <div className="text-white font-semibold mt-2">
                  Smarter fan experience
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wide">
                  Leagues
                </div>
                <div className="text-white font-semibold mt-2">
                  Premier League & La Liga
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs uppercase tracking-wide">
                  Next step
                </div>
                <div className="text-white font-semibold mt-2">
                  Matchday companion improving
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Your Teams"
          subtitle="Personalize your matchday by saving favorite teams."
          action={
            <Link
              to="/leagues"
              className="text-sm text-slate-300 hover:text-white"
            >
              {favorites.length > 0
                ? "Add more teams"
                : "Choose favorite teams"}
            </Link>
          }
        />

        {favorites.length ? (
          teamsLoading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favorites.map((teamId) => (
                <DashboardCard key={teamId} className="animate-pulse">
                  <div className="h-20 bg-slate-800 rounded-lg" />
                </DashboardCard>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favoriteTeams.map((team) => (
                <FavoriteTeamCard key={team.id} team={team} />
              ))}
            </div>
          )
        ) : (
          <EmptyState
            title="Choose your favorite teams"
            desc="Save teams from league or team pages to personalize your homepage. Once you do, this section will show your real clubs and the homepage will prioritize their upcoming matches."
            action={
              <Link
                to="/leagues"
                className="inline-block px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Browse Leagues
              </Link>
            }
          />
        )}
      </section>

      <section>
        <SectionHeader
          title="Matches to Watch"
          subtitle={
            favorites.length
              ? "Your favorite teams' next matches are prioritized first, followed by notable upcoming league fixtures."
              : "Upcoming notable fixtures across supported leagues."
          }
        />

        {matchesLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <DashboardCard key={i} className="animate-pulse p-4">
                <div className="h-28 bg-slate-800 rounded-lg" />
              </DashboardCard>
            ))}
          </div>
        ) : matchesToWatch.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {matchesToWatch.map((match) => (
              <MatchMiniCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming matches found"
            desc="Try again shortly or browse leagues directly while new fixtures are fetched."
            action={
              <Link
                to="/leagues"
                className="inline-block px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Explore Leagues
              </Link>
            }
          />
        )}
      </section>

      <section>
        <SectionHeader
          title="What to Know Today"
          subtitle={
            favorites.length
              ? "A smarter look at your teams' biggest storylines right now."
              : "Save favorite teams to unlock a personalized matchday briefing."
          }
        />

        <TodayInsightsGrid
          insights={todayInsights}
          isLoading={todayInsightsLoading}
          hasFavorites={favorites.length > 0}
        />
      </section>

      <section>
        <SectionHeader
          title="Explore Competitions"
          subtitle="Jump into supported leagues and browse teams, standings, and matches."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {Object.values(LEAGUES).map((league) => (
            <LeagueCard key={league.code} league={league} />
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <Feature
          icon={Trophy}
          title="Standings"
          desc="Current tables, positions, and league context."
        />
        <Feature
          icon={Calendar}
          title="Matches"
          desc="Browse fixtures and results across supported leagues."
        />
        <Feature
          icon={Users}
          title="Teams"
          desc="Explore team pages and begin personalizing your dashboard."
        />
        <Feature
          icon={Brain}
          title="Insights"
          desc="A growing contextual layer that will explain why matches matter."
        />
      </section>
    </div>
  );
}
