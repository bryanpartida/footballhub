import { Link } from "react-router-dom";
import { ArrowRight, Brain } from "lucide-react";

const toneMap = {
  sky: {
    border: "border-sky-900/60",
    badge: "bg-sky-950/60 text-sky-300 border border-sky-900/60",
  },
  emerald: {
    border: "border-emerald-900/60",
    badge: "bg-emerald-950/60 text-emerald-300 border border-emerald-900/60",
  },
  rose: {
    border: "border-rose-900/60",
    badge: "bg-rose-950/60 text-rose-300 border border-rose-900/60",
  },
  amber: {
    border: "border-amber-900/60",
    badge: "bg-amber-950/60 text-amber-300 border border-amber-900/60",
  },
  slate: {
    border: "border-slate-800",
    badge: "bg-slate-900 text-slate-300 border border-slate-800",
  },
};

function TodayInsightCard({ insight }) {
  const tone = toneMap[insight.tone] || toneMap.slate;

  return (
    <Link
      to={insight.href}
      className={`block bg-slate-950 ${tone.border} border rounded-xl p-5 hover:bg-slate-900 transition`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {insight.teamCrest ? (
            <img
              src={insight.teamCrest}
              alt={`${insight.teamName} crest`}
              className="w-10 h-10 object-contain shrink-0"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
          )}

          <div className="min-w-0">
            <div
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tone.badge}`}
            >
              {insight.badge}
            </div>
            <div className="text-slate-400 text-xs mt-2 truncate">
              {insight.teamName}
            </div>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
      </div>

      <h3 className="text-white font-semibold text-lg mt-4">{insight.title}</h3>
      <p className="text-slate-400 text-sm mt-2 leading-6">{insight.body}</p>
    </Link>
  );
}

export default function TodayInsightsGrid({
  insights = [],
  isLoading = false,
  hasFavorites = false,
}) {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-slate-950 border border-slate-800 rounded-xl p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="h-6 w-2/3 bg-slate-800 rounded mt-4" />
            <div className="h-4 w-full bg-slate-800 rounded mt-3" />
            <div className="h-4 w-5/6 bg-slate-800 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!hasFavorites) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-slate-300" />
          <h3 className="text-white font-semibold">
            Start with favorite teams
          </h3>
        </div>
        <p className="text-slate-400 text-sm mt-3 max-w-2xl">
          Save a few teams and this section will turn into a live matchday
          briefing with form, next-match urgency, and standings pressure.
        </p>
      </div>
    );
  }

  if (!insights.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-slate-300" />
          <h3 className="text-white font-semibold">No major storylines yet</h3>
        </div>
        <p className="text-slate-400 text-sm mt-3 max-w-2xl">
          Your teams are loaded, but there are no strong homepage insights right
          now. This usually happens when there are no nearby fixtures or not
          enough recent context.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {insights.map((insight) => (
        <TodayInsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
