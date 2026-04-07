const toneStyles = {
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
  sky: {
    border: "border-sky-900/60",
    badge: "bg-sky-950/60 text-sky-300 border border-sky-900/60",
  },
  slate: {
    border: "border-slate-800",
    badge: "bg-slate-900 text-slate-300 border border-slate-800",
  },
};

export default function MatchdayCompanion({ items = [] }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-800">
        <h2 className="text-white font-semibold text-xl">Matchday Companion</h2>
        <p className="text-xs text-slate-400 mt-1">
          The main storylines behind this match.
        </p>
      </div>

      <div className="p-4 md:p-6">
        {items.length ? (
          <div className="grid gap-4">
            {items.map((item) => {
              const tone = toneStyles[item.tone] || toneStyles.slate;

              return (
                <article
                  key={item.id}
                  className={`bg-slate-950 border rounded-xl p-5 ${tone.border}`}
                >
                  <div
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${tone.badge}`}
                  >
                    Storyline
                  </div>

                  <h3 className="text-white font-semibold text-lg mt-4">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 leading-6">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-400">
            No major storylines stand out for this match yet.
          </div>
        )}
      </div>
    </section>
  );
}
