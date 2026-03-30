import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, Brain } from "lucide-react";
import { LEAGUES } from "../api/footballData";
import { useCompetition } from "../hooks/useCompetition";
import logo from "../logo/footballhub-logo.png";

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-slate-200" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}

function LeagueEmblem({ code, fallback }) {
  const q = useCompetition(code);
  const emblem = q.data?.emblem;

  // if emblem fails to load, fall back to your emoji flag
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

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-10">
        <div className="text-7xl">
          <img
            src={logo}
            alt="FootballHub logo"
            className="w-20 h-20 object-contain mx-auto drop-shadow"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Soccer Stats & Trivia
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Premier League and La Liga standings, match results, team pages, and a
          trivia mini-game powered by real data.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        {Object.values(LEAGUES).map((l) => (
          <div
            key={l.code}
            className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-600 transition"
          >
            <div className="text-center space-y-3">
              <LeagueEmblem code={l.code} fallback={l.flag} />
              {/* <h2 className="text-2xl font-bold text-white">{l.name}</h2> */}
              <p className="text-slate-400">{l.country}</p>
              <Link
                to={`/league/${l.code}`}
                className="inline-block mt-2 px-5 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                View League
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <Feature
          icon={Trophy}
          title="Standings"
          desc="Current table with points and form indicators."
        />
        <Feature
          icon={Calendar}
          title="Matches"
          desc="Browse fixtures/results with filter controls."
        />
        <Feature
          icon={Users}
          title="Teams"
          desc="Open a team page and explore details."
        />
        <Feature
          icon={Brain}
          title="Trivia"
          desc="Answer questions generated from live data."
        />
      </section>
    </div>
  );
}
