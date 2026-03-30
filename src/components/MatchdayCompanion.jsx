export default function MatchdayCompanion({ insights = [] }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-800">
        <h2 className="text-white font-semibold text-xl">Matchday Companion</h2>
        <p className="text-xs text-slate-400 mt-1">
          Why this match matters and what to watch.
        </p>
      </div>

      <div className="p-4 md:p-6">
        {insights.length ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li
                key={index}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200"
              >
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-400">
            No contextual insights available for this match yet.
          </div>
        )}
      </div>
    </section>
  );
}
