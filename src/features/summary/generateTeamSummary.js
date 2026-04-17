export function generateTeamSummary({ team, context, leagueName }) {
  const name = team?.shortName || team?.name || "This team";
  const nextMatch = context?.nextMatch || null;
  const nextOpponent =
    context?.nextOpponent || getOpponent(nextMatch, team?.id);
  const standingRow = context?.standingRow || null;
  const standings = Array.isArray(context?.standings) ? context.standings : [];
  const leader = context?.leader || null;
  const second = context?.second || null;
  const fourth = context?.fourth || null;
  const relegationLine = context?.relegationLine || null;
  const form = Array.isArray(context?.form) ? context.form : [];

  if (!nextMatch && !standingRow && !form.length) {
    return `${name} is loaded, but there is not enough live context yet to build a useful daily briefing.`;
  }

  const opener = buildSituationLine({
    name,
    nextMatch,
    nextOpponent,
    standingRow,
    leader,
    second,
    fourth,
    relegationLine,
    standings,
    leagueName,
  });

  const followUp = buildAttentionLine({
    name,
    nextMatch,
    nextOpponent,
    standingRow,
    form,
    leader,
    fourth,
    relegationLine,
  });

  return [opener, followUp].filter(Boolean).join(" ");
}

function buildSituationLine({
  name,
  nextMatch,
  nextOpponent,
  standingRow,
  leader,
  second,
  fourth,
  relegationLine,
  standings,
  leagueName,
}) {
  const matchTiming = getMatchTiming(nextMatch?.utcDate);
  const opponentName =
    nextOpponent?.shortName || nextOpponent?.name || "their next opponent";

  if (standingRow?.position === 1) {
    const lead = second ? standingRow.points - second.points : null;
    if (matchTiming.isToday && nextMatch) {
      return `${name} are top of ${leagueName || "the league"}, and today's match against ${opponentName} is about protecting control${lead != null ? ` of a ${lead}-point lead` : ""}.`;
    }
    if (nextMatch) {
      return `${name} are top of ${leagueName || "the league"}, so this is a stretch where momentum matters as much as the table${lead != null ? ` with only ${lead} point${lead === 1 ? "" : "s"} in hand` : ""}.`;
    }
    return `${name} are setting the pace in ${leagueName || "the league"}, and the story right now is whether they can keep control of the race.`;
  }

  if (standingRow && leader && leader.team?.id !== standingRow.team?.id) {
    const gapToTop = leader.points - standingRow.points;
    if (gapToTop > 0 && gapToTop <= 4) {
      if (matchTiming.isToday && nextMatch) {
        return `${name} are close enough to keep real title pressure on, so today's match against ${opponentName} matters because dropped points could shift the race.`;
      }
      if (nextMatch) {
        return `${name} are still within ${gapToTop} point${gapToTop === 1 ? "" : "s"} of the top, so this is less about waiting and more about staying in the title conversation.`;
      }
      return `${name} are still within ${gapToTop} point${gapToTop === 1 ? "" : "s"} of the top, which keeps the title conversation alive even without a visible match today.`;
    }
  }

  if (standingRow && fourth) {
    const gapToTopFour = fourth.points - standingRow.points;
    if (standingRow.position <= 4) {
      const below = standings[standingRow.position] || null;
      const cushion = below ? standingRow.points - below.points : null;
      if (matchTiming.isToday && nextMatch) {
        return `${name} are in the Champions League places, and today's match against ${opponentName} matters because the margin for error is still thin${cushion != null ? ` at ${cushion} point${cushion === 1 ? "" : "s"}` : ""}.`;
      }
      return `${name} are in the Champions League places, and the main story now is whether they can hold that position through the next phase of the run-in.`;
    }

    if (standingRow.position <= 6 && gapToTopFour >= 0 && gapToTopFour <= 4) {
      if (matchTiming.isToday && nextMatch) {
        return `${name} are chasing a Champions League place, and today's match against ${opponentName} matters because a single result can swing that race quickly.`;
      }
      if (nextMatch) {
        return `${name} are close enough to the top four that this is a momentum stretch, not a quiet one, heading into ${opponentName}.`;
      }
      return `${name} are close enough to the top four that every good result still changes the tone around them.`;
    }
  }

  if (standingRow && relegationLine) {
    const gapToDrop = standingRow.points - relegationLine.points;
    if (gapToDrop >= 0 && gapToDrop <= 4) {
      if (matchTiming.isToday && nextMatch) {
        return `${name} are playing with real table pressure right now, and today's match against ${opponentName} matters because the relegation line is still too close for comfort.`;
      }
      return `${name} are still too close to the relegation line for this to feel comfortable, so the next stretch is about creating breathing room.`;
    }
  }

  if (nextMatch) {
    if (matchTiming.isToday) {
      return `${name} are back in action today against ${opponentName}, and this looks more like a momentum match than a quiet stop in the schedule.`;
    }
    return `${name} do not play today, but the next match against ${opponentName} is the obvious next checkpoint in their week.`;
  }

  return `${name} are in a steadier part of the season right now, so the focus is on how their recent level shapes what comes next.`;
}

function buildAttentionLine({
  nextMatch,
  nextOpponent,
  standingRow,
  form,
  leader,
  fourth,
  relegationLine,
}) {
  const formRead = getFormRead(form);
  const matchTiming = getMatchTiming(nextMatch?.utcDate);
  const opponentName =
    nextOpponent?.shortName || nextOpponent?.name || "the next opponent";

  if (matchTiming.isToday) {
    if (formRead.state === "hot") {
      return `The main thing to watch is whether they can carry this run into ${opponentName} rather than let the pressure reset.`;
    }
    if (formRead.state === "cold") {
      return `The main thing to watch is the response, because recent results have left them needing a steadier performance.`;
    }
    return `The key watchpoint is whether they can turn a mixed spell into something more convincing once kickoff arrives.`;
  }

  if (nextMatch) {
    if (formRead.state === "hot") {
      return `There is no match today, but the useful signal is whether this strong run still feels intact heading into ${opponentName} ${whenText(nextMatch.utcDate)}.`;
    }
    if (formRead.state === "cold") {
      return `There is no match today, but the useful signal is whether they can reset the tone before ${opponentName} ${whenText(nextMatch.utcDate)}.`;
    }
    return `There is no match today, so the main thing to track is whether this team feels stable or still unresolved before ${opponentName} ${whenText(nextMatch.utcDate)}.`;
  }

  if (standingRow && leader && leader.team?.id !== standingRow.team?.id) {
    const gapToTop = leader.points - standingRow.points;
    if (gapToTop > 0 && gapToTop <= 4) {
      return `Even without a visible fixture, the important thing is that they are still close enough for pressure above them to matter.`;
    }
  }

  if (standingRow && fourth) {
    const gapToTopFour = fourth.points - standingRow.points;
    if (
      standingRow.position > 4 &&
      standingRow.position <= 6 &&
      gapToTopFour >= 0 &&
      gapToTopFour <= 4
    ) {
      return `What matters now is whether the next couple of results can turn this into a real top-four push instead of just hanging around it.`;
    }
  }

  if (standingRow && relegationLine) {
    const gapToDrop = standingRow.points - relegationLine.points;
    if (gapToDrop >= 0 && gapToDrop <= 4) {
      return `What to watch is whether they can create even a small cushion, because the table still leaves very little room for drift.`;
    }
  }

  if (formRead.state === "hot") {
    return `The signal to watch is whether good momentum is becoming something durable rather than just a short spell.`;
  }

  if (formRead.state === "cold") {
    return `The signal to watch is whether the next turn in form looks like recovery or the start of a longer problem.`;
  }

  return `The signal to watch is whether the next step clarifies this team, because the current picture still feels balanced rather than decisive.`;
}

function getFormRead(form) {
  if (!form.length) {
    return { state: "unknown" };
  }

  const wins = form.filter((result) => result === "W").length;
  const losses = form.filter((result) => result === "L").length;
  const firstThree = form.slice(0, 3);

  if (wins >= 3 && losses === 0) {
    return { state: "hot" };
  }

  if (firstThree.every((result) => result === "W")) {
    return { state: "hot" };
  }

  if (losses >= 3) {
    return { state: "cold" };
  }

  if (firstThree.filter((result) => result === "L").length >= 2) {
    return { state: "cold" };
  }

  return { state: "mixed" };
}

function getOpponent(match, teamId) {
  return Number(match?.homeTeam?.id) === Number(teamId)
    ? match?.awayTeam
    : match?.homeTeam;
}

function whenText(utcDate) {
  if (!utcDate) return "soon";
  const timing = getMatchTiming(utcDate);
  if (timing.isToday) return "today";
  if (timing.diffDays === 1) return "tomorrow";
  return `on ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(utcDate))}`;
}

function getMatchTiming(utcDate) {
  if (!utcDate) {
    return { isToday: false, diffDays: null };
  }

  const now = new Date();
  const kick = new Date(utcDate);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfKick = new Date(
    kick.getFullYear(),
    kick.getMonth(),
    kick.getDate(),
  );
  const diffDays = Math.round(
    (startOfKick - startOfToday) / (1000 * 60 * 60 * 24),
  );

  return {
    isToday: diffDays === 0,
    diffDays,
  };
}
