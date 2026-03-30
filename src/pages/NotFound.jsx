import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, LEAGUES } from "../api/footballData";

function pickTwoTeams(table) {
  if (table.length < 2) return null;
  const a = table[Math.floor(Math.random() * table.length)];
  let b = table[Math.floor(Math.random() * table.length)];
  while (b.team.id === a.team.id)
    b = table[Math.floor(Math.random() * table.length)];
  return [a, b];
}

export default function Trivia() {
  const [leagueCode, setLeagueCode] = useState("PL");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState("");
  const [pair, setPair] = useState(null);

  const standingsQuery = useQuery({
    queryKey: ["standings", leagueCode],
    queryFn: () => api.standings(leagueCode),
  });

  const table = standingsQuery.data?.standings?.[0]?.table ?? [];

  const correctTeamId = useMemo(() => {
    if (!pair) return null;
    // higher on table = smaller position number
    return pair[0].position < pair[1].position
      ? pair[0].team.id
      : pair[1].team.id;
  }, [pair]);

  function nextQuestion() {
    const p = pickTwoTeams(table);
    setPair(p);
    setFeedback("");
  }

  useEffect(() => {
    if (table.length) nextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueCode, standingsQuery.isSuccess]);

  function answer(teamId) {
    const ok = teamId === correctTeamId;
    setScore((s) => ({
      correct: s.correct + (ok ? 1 : 0),
      total: s.total + 1,
    }));
    setFeedback(ok ? "Correct! ✅" : "Incorrect ❌");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Soccer Trivia</h1>
          <p className="text-slate-400 text-sm">
            Questions generated from live standings data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300">
            Score:{" "}
            <span className="text-white font-semibold">
              {score.correct}/{score.total}
            </span>
          </div>
          <select
            className="bg-slate-950 border border-slate-800 rounded-md p-2 text-sm"
            value={leagueCode}
            onChange={(e) => setLeagueCode(e.target.value)}
          >
            {Object.values(LEAGUES).map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {standingsQuery.isLoading && (
          <p className="text-slate-300">Loading trivia...</p>
        )}
        {standingsQuery.isError && (
          <p className="text-red-300">{standingsQuery.error.message}</p>
        )}

        {pair && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Which team is higher in the current standings?
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => answer(pair[0].team.id)}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-left"
              >
                {pair[0].team.name}
              </button>
              <button
                onClick={() => answer(pair[1].team.id)}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-900 text-left"
              >
                {pair[1].team.name}
              </button>
            </div>

            {feedback && (
              <div className="text-white font-semibold">{feedback}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={nextQuestion}
                className="px-4 py-2 rounded-md bg-white text-slate-900 font-semibold hover:opacity-90"
              >
                Next Question
              </button>
              <button
                onClick={() => setScore({ correct: 0, total: 0 })}
                className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-700"
              >
                Reset Score
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
