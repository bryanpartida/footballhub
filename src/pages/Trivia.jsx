import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, LEAGUES } from "../api/footballData";

// ----- helpers -----
function randInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinctRows(table, n) {
  if (table.length < n) return null;
  const picked = new Set();
  const rows = [];
  while (rows.length < n) {
    const r = table[randInt(table.length)];
    if (picked.has(r.team.id)) continue;
    picked.add(r.team.id);
    rows.push(r);
  }
  return rows;
}

function compareRows(rowA, rowB, metric) {
  // return the "better" row depending on metric
  switch (metric) {
    case "position": // smaller is better
      return rowA.position < rowB.position ? rowA : rowB;
    case "points":
      return rowA.points > rowB.points ? rowA : rowB;
    case "gd":
      return rowA.goalDifference > rowB.goalDifference ? rowA : rowB;
    case "gf":
      return rowA.goalsFor > rowB.goalsFor ? rowA : rowB;
    case "ga": // fewer goals conceded is better
      return rowA.goalsAgainst < rowB.goalsAgainst ? rowA : rowB;
    default:
      return rowA;
  }
}

// ----- question builders -----
function buildQuestion(table) {
  // choose from 5 types of questions
  const types = [
    "HIGHER_POSITION",
    "MORE_POINTS",
    "BETTER_GD",
    "MORE_GOALS_FOR",
    "FEWER_GOALS_AGAINST",
  ];

  const type = types[randInt(types.length)];

  const pair = pickDistinctRows(table, 2);
  if (!pair) return null;
  const [a, b] = pair;

  if (type === "HIGHER_POSITION") {
    const correct = compareRows(a, b, "position");
    return {
      id: crypto.randomUUID?.() || String(Date.now()),
      type,
      prompt: "Which team is higher in the current standings?",
      options: [a, b].map((r) => ({
        teamId: r.team.id,
        name: r.team.name,
        row: r,
      })),
      correctTeamId: correct.team.id,
    };
  }

  if (type === "MORE_POINTS") {
    const correct = compareRows(a, b, "points");
    return {
      id: crypto.randomUUID?.() || String(Date.now()),
      type,
      prompt: "Which team has more points right now?",
      options: [a, b].map((r) => ({
        teamId: r.team.id,
        name: r.team.name,
        row: r,
      })),
      correctTeamId: correct.team.id,
    };
  }

  if (type === "BETTER_GD") {
    const correct = compareRows(a, b, "gd");
    return {
      id: crypto.randomUUID?.() || String(Date.now()),
      type,
      prompt: "Which team has the better goal difference (GD)?",
      options: [a, b].map((r) => ({
        teamId: r.team.id,
        name: r.team.name,
        row: r,
      })),
      correctTeamId: correct.team.id,
    };
  }

  if (type === "MORE_GOALS_FOR") {
    const correct = compareRows(a, b, "gf");
    return {
      id: crypto.randomUUID?.() || String(Date.now()),
      type,
      prompt: "Which team has scored more goals (GF)?",
      options: [a, b].map((r) => ({
        teamId: r.team.id,
        name: r.team.name,
        row: r,
      })),
      correctTeamId: correct.team.id,
    };
  }

  // FEWER_GOALS_AGAINST
  const correct = compareRows(a, b, "ga");
  return {
    id: crypto.randomUUID?.() || String(Date.now()),
    type,
    prompt: "Which team has conceded fewer goals (GA)?",
    options: [a, b].map((r) => ({
      teamId: r.team.id,
      name: r.team.name,
      row: r,
    })),
    correctTeamId: correct.team.id,
  };
}

export default function Trivia() {
  const TARGET_STREAK = 10;

  const [leagueCode, setLeagueCode] = useState("PL");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [question, setQuestion] = useState(null);
  const [winner, setWinner] = useState(false);

  // standings table (main data)
  const standingsQuery = useQuery({
    queryKey: ["standings", leagueCode],
    queryFn: () => api.standings(leagueCode),
  });

  // teams list (crest lookup fallback)
  const teamsQuery = useQuery({
    queryKey: ["teams", leagueCode],
    queryFn: () => api.teams(leagueCode),
  });

  const crestById = useMemo(() => {
    const map = new Map();
    (teamsQuery.data?.teams ?? []).forEach((t) => {
      map.set(t.id, t.crest || t.crestUrl);
    });
    return map;
  }, [teamsQuery.data]);

  const table = standingsQuery.data?.standings?.[0]?.table ?? [];

  function getCrestByTeamId(teamId) {
    return crestById.get(teamId);
  }

  function newQuestion() {
    const q = buildQuestion(table);
    if (!q) return;
    // attach crests
    const options = q.options.map((opt) => ({
      ...opt,
      crest: getCrestByTeamId(opt.teamId),
    }));
    setQuestion({ ...q, options: shuffle(options) });
    setFeedback("");
    setLocked(false);
  }

  // when league changes or data arrives: reset run
  useEffect(() => {
    if (!table.length) return;
    setStreak(0);
    setBestStreak(0);
    setWinner(false);
    newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueCode, standingsQuery.isSuccess, teamsQuery.isSuccess]);

  function handleAnswer(teamId) {
    if (!question || locked || winner) return;

    setLocked(true);
    const ok = teamId === question.correctTeamId;

    if (ok) {
      setFeedback("Correct! ✅");
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));

        if (next >= TARGET_STREAK) {
          setWinner(true);
          setFeedback("🏆 Congratulations! Perfect 10 in a row! 🏆");
        }
        return next;
      });
    } else {
      setFeedback("Incorrect ❌ Run reset. Try again!");
      setStreak(0);
    }
  }

  function next() {
    if (winner) return;
    newQuestion();
  }

  function resetRun() {
    setStreak(0);
    setBestStreak(0);
    setWinner(false);
    setFeedback("");
    setLocked(false);
    if (table.length) newQuestion();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Trivia Challenge</h1>
          <p className="text-slate-400 text-sm">
            Goal: answer <span className="text-white font-semibold">10</span>{" "}
            questions in a row with{" "}
            <span className="text-white font-semibold">no mistakes</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300">
            Streak: <span className="text-white font-semibold">{streak}</span> /{" "}
            {TARGET_STREAK}
          </div>
          <div className="text-sm text-slate-300 hidden sm:block">
            Best: <span className="text-white font-semibold">{bestStreak}</span>
          </div>
          <select
            className="bg-slate-950 border border-slate-800 rounded-md p-2 text-sm"
            value={leagueCode}
            onChange={(e) => setLeagueCode(e.target.value)}
            disabled={locked && !winner} // optional: prevents switching mid-question
          >
            {Object.values(LEAGUES).map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {(standingsQuery.isLoading || teamsQuery.isLoading) && (
          <p className="text-slate-300">Loading trivia...</p>
        )}

        {(standingsQuery.isError || teamsQuery.isError) && (
          <p className="text-red-300">
            {standingsQuery.error?.message || teamsQuery.error?.message}
          </p>
        )}

        {!standingsQuery.isLoading &&
          !teamsQuery.isLoading &&
          !table.length && (
            <p className="text-slate-300">
              No standings data available for trivia.
            </p>
          )}

        {question && (
          <div className="space-y-4">
            {/* Winner banner */}
            {winner && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🏆</div>
                <div className="text-2xl font-bold text-white">
                  Perfect Run!
                </div>
                <div className="text-slate-300 mt-2">
                  You answered {TARGET_STREAK} questions correctly in a row.
                </div>
              </div>
            )}

            {!winner && (
              <>
                <h2 className="text-xl font-semibold text-white">
                  {question.prompt}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {question.options.map((opt) => (
                    <button
                      key={opt.teamId}
                      onClick={() => handleAnswer(opt.teamId)}
                      disabled={locked}
                      className={`p-4 rounded-lg bg-slate-950 border border-slate-800 text-left transition
                        ${locked ? "opacity-80 cursor-not-allowed" : "hover:bg-slate-900"}`}
                    >
                      <div className="flex items-center gap-3">
                        {opt.crest && (
                          <img
                            src={opt.crest}
                            alt={`${opt.name} crest`}
                            className="w-7 h-7 object-contain"
                            loading="lazy"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        )}
                        <span className="text-white font-semibold">
                          {opt.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {feedback && (
              <div className="text-white font-semibold text-center">
                {feedback}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!winner ? (
                <button
                  onClick={next}
                  className="px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={resetRun}
                  className="px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
                >
                  Play Again
                </button>
              )}

              <button
                onClick={resetRun}
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
              >
                Reset Run
              </button>
            </div>

            {!winner && (
              <p className="text-xs text-slate-400 text-center">
                Question types rotate (position, points, goal difference, goals
                for, goals against).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
