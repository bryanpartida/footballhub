// TODO: fix favorite dipslay
// TODO: diplsay most important matches based on team favorited
// TODO: what to know today worked out

// NOTE: might want to update design in future

import { Link } from "react-router-dom";
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

function FavoriteTeamCard({ teamId }) {
  return (
    <Link
      to={`/team/${teamId}`}
      className="block bg-slate-950 border border-slate-800 rounded-lg p-4 hover:bg-slate-900 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            Favorite Team
          </div>
          <h3 className="text-white font-semibold mt-2">Team #{teamId}</h3>
          <p className="text-slate-400 text-sm mt-1">
            Personalized team dashboard coming next.
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
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

export default function Home() {
  const { favorites } = useFavorites();

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

            <div className="grid grid-cols-2 gap-4 min-w-260px">
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
                  Matchday Companion
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
            favorites.length > 0 ? (
              <Link
                to="/leagues"
                className="text-sm text-slate-300 hover:text-white"
              >
                Add more teams
              </Link>
            ) : null
          }
        />

        {favorites.length ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {favorites.map((teamId) => (
              <FavoriteTeamCard key={teamId} teamId={teamId} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No favorite teams yet"
            desc="Start building your personalized football dashboard by adding teams from league or team pages. Soon, this section will highlight upcoming matches, recent results, and relevant matchday context."
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
          subtitle="A preview area for notable fixtures and upcoming matchday context."
        />

        <div className="grid md:grid-cols-2 gap-4">
          <PlaceholderInsightCard
            title="Featured match previews coming soon"
            desc="This section will surface selected fixtures with pre-match context like form, table importance, and key storylines."
          />
          <PlaceholderInsightCard
            title="Favorite-team prioritization coming soon"
            desc="Upcoming matches involving your saved teams will be surfaced here first, making the homepage feel more personal and useful."
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="What to Know Today"
          subtitle="A placeholder for the Matchday Companion insight layer."
        />

        <div className="grid lg:grid-cols-3 gap-4">
          <PlaceholderInsightCard
            title="Why a result matters"
            desc="Example: A win could move a team into Champions League places, while a loss could drop them behind a direct rival."
          />
          <PlaceholderInsightCard
            title="Form and momentum"
            desc="Example: A team may be unbeaten in five matches, or struggling after multiple losses in a row."
          />
          <PlaceholderInsightCard
            title="What might happen next"
            desc="Example: Later results in the same league could reshape the table depending on today’s outcome."
          />
        </div>
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
