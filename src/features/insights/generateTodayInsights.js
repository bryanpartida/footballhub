const DAY_MS = 24 * 60 * 60 * 1000;

export function generateTodayInsights({
  favoriteTeams = [],
  scheduledMatchesByTeam = new Map(),
  finishedMatchesByTeam = new Map(),
  standingsTablesByLeague = new Map(),
  leagueMetaByCode = {},
}) {
  const insights = [];

  favoriteTeams.forEach((team) => {
    const teamId = Number(team.id);
    const scheduled = [...(scheduledMatchesByTeam.get(teamId) || [])].sort(
      (a, b) => new Date(a.utcDate) - new Date(b.utcDate),
    );
    const finished = [...(finishedMatchesByTeam.get(teamId) || [])].sort(
      (a, b) => new Date(b.utcDate) - new Date(a.utcDate),
    );

    const nextMatch = scheduled[0];
    const lastMatch = finished[0];
    const form = summarizeForm(finished, teamId);
    const standingInfo = findStandingInfo(
      teamId,
      standingsTablesByLeague,
      leagueMetaByCode,
    );

    if (nextMatch) {
      const kickoff = getKickoffContext(nextMatch.utcDate);
      const opponent = getOpponentName(nextMatch, teamId);
      const competitionName =
        nextMatch.competition?.name || standingInfo?.leagueName || "next match";
      const isEuropeanNight = /champions|europa|conference/i.test(
        competitionName,
      );

      if (kickoff.isToday || kickoff.isTomorrow || isEuropeanNight) {
        insights.push({
          id: `next-${teamId}-${nextMatch.id}`,
          teamId,
          teamName: team.name,
          teamCrest: team.crest || team.crestUrl || null,
          tone: isEuropeanNight ? "amber" : "sky",
          badge: kickoff.badge,
          title: `${team.name} is back ${kickoff.label}`,
          body: `${team.name} faces ${opponent} in the ${competitionName}.`,
          href: `/match/${nextMatch.id}`,
          priority: kickoff.isToday ? 100 : kickoff.isTomorrow ? 96 : 90,
        });
      }
    }

    if (lastMatch && nextMatch && getResult(lastMatch, teamId) === "LOSS") {
      const daysToNext = daysUntil(nextMatch.utcDate);
      if (daysToNext <= 3) {
        const opponent = getOpponentName(nextMatch, teamId);
        const lastResultText = describeResult(lastMatch, teamId);

        insights.push({
          id: `bounce-${teamId}-${nextMatch.id}`,
          teamId,
          teamName: team.name,
          teamCrest: team.crest || team.crestUrl || null,
          tone: "rose",
          badge: "Bounce-back spot",
          title: `${team.name} needs a response`,
          body: `${team.name} is coming off ${lastResultText} and now faces ${opponent} next.`,
          href: `/match/${nextMatch.id}`,
          priority: 94,
        });
      }
    }

    if (form.streakType === "WIN" && form.streakCount >= 2) {
      insights.push({
        id: `form-win-${teamId}`,
        teamId,
        teamName: team.name,
        teamCrest: team.crest || team.crestUrl || null,
        tone: "emerald",
        badge: "Form",
        title: `${team.name} is carrying momentum`,
        body: `${team.name} has won ${form.wins} of its last ${form.sampleSize} matches, including ${form.streakCount} straight wins.`,
        href: `/team/${teamId}`,
        priority: 88,
      });
    }

    if (form.streakType === "LOSS" && form.streakCount >= 2) {
      insights.push({
        id: `form-loss-${teamId}`,
        teamId,
        teamName: team.name,
        teamCrest: team.crest || team.crestUrl || null,
        tone: "rose",
        badge: "Form",
        title: `${team.name} is under pressure`,
        body: `${team.name} has dropped ${form.losses} of its last ${form.sampleSize} matches, including ${form.streakCount} straight defeats.`,
        href: `/team/${teamId}`,
        priority: 87,
      });
    }

    if (standingInfo?.row) {
      const { row, table, leagueCode, leagueName } = standingInfo;
      const first = table[0];
      const below = table[row.position];
      const fourth = table[3];

      if (row.position === 1) {
        const lead =
          table[1] && table[1].points != null
            ? row.points - table[1].points
            : null;

        insights.push({
          id: `table-first-${teamId}`,
          teamId,
          teamName: team.name,
          teamCrest: team.crest || team.crestUrl || null,
          tone: "amber",
          badge: leagueName,
          title: `${team.name} is setting the pace`,
          body:
            lead != null
              ? `${team.name} sits 1st in ${leagueName} with a ${lead}-point lead at the top.`
              : `${team.name} sits 1st in ${leagueName}.`,
          href: `/league/${leagueCode}/standings`,
          priority: 85,
        });
      } else if (row.position <= 4) {
        const cushion =
          below && below.points != null ? row.points - below.points : null;

        insights.push({
          id: `table-top4-${teamId}`,
          teamId,
          teamName: team.name,
          teamCrest: team.crest || team.crestUrl || null,
          tone: "sky",
          badge: leagueName,
          title: `${team.name} is protecting a top-four place`,
          body:
            cushion != null
              ? `${team.name} is ${ordinal(row.position)} in ${leagueName}, with a ${cushion}-point cushion over the team directly below.`
              : `${team.name} is ${ordinal(row.position)} in ${leagueName}.`,
          href: `/league/${leagueCode}/standings`,
          priority: 82,
        });
      } else if (row.position <= 6 && fourth) {
        const gapToTopFour = fourth.points - row.points;

        insights.push({
          id: `table-chase-${teamId}`,
          teamId,
          teamName: team.name,
          teamCrest: team.crest || team.crestUrl || null,
          tone: "amber",
          badge: leagueName,
          title: `${team.name} is chasing Europe`,
          body: `${team.name} is ${ordinal(row.position)} in ${leagueName}, ${gapToTopFour} point${gapToTopFour === 1 ? "" : "s"} away from the top four.`,
          href: `/league/${leagueCode}/standings`,
          priority: 80,
        });
      }

      if (first && first.team?.id !== teamId) {
        const gapToTop = first.points - row.points;
        if (gapToTop > 0 && gapToTop <= 3) {
          insights.push({
            id: `table-race-${teamId}`,
            teamId,
            teamName: team.name,
            teamCrest: team.crest || team.crestUrl || null,
            tone: "emerald",
            badge: leagueName,
            title: `${team.name} is still within touching distance`,
            body: `${team.name} is only ${gapToTop} point${gapToTop === 1 ? "" : "s"} off the top of ${leagueName}.`,
            href: `/league/${leagueCode}/standings`,
            priority: 83,
          });
        }
      }
    }
  });

  const sorted = [...insights].sort((a, b) => b.priority - a.priority);
  const limited = limitPerTeam(sorted, 2);

  return uniqueById(limited).slice(0, 4);
}

function summarizeForm(matches, teamId) {
  const recent = matches
    .filter((m) => getResult(m, teamId) !== null)
    .slice(0, 5);

  let wins = 0;
  let losses = 0;
  let draws = 0;

  recent.forEach((match) => {
    const result = getResult(match, teamId);
    if (result === "WIN") wins += 1;
    if (result === "LOSS") losses += 1;
    if (result === "DRAW") draws += 1;
  });

  const streak = getStreak(recent, teamId);

  return {
    wins,
    losses,
    draws,
    sampleSize: recent.length,
    streakType: streak.type,
    streakCount: streak.count,
  };
}

function getStreak(matches, teamId) {
  let type = null;
  let count = 0;

  for (const match of matches) {
    const result = getResult(match, teamId);
    if (!result) continue;

    if (!type) {
      type = result;
      count = 1;
      continue;
    }

    if (result === type) {
      count += 1;
    } else {
      break;
    }
  }

  return { type, count };
}

function getResult(match, teamId) {
  const homeId = match?.homeTeam?.id;
  const awayId = match?.awayTeam?.id;
  const homeScore = match?.score?.fullTime?.home;
  const awayScore = match?.score?.fullTime?.away;

  if (homeScore == null || awayScore == null) return null;

  if (homeId === teamId) {
    if (homeScore > awayScore) return "WIN";
    if (homeScore < awayScore) return "LOSS";
    return "DRAW";
  }

  if (awayId === teamId) {
    if (awayScore > homeScore) return "WIN";
    if (awayScore < homeScore) return "LOSS";
    return "DRAW";
  }

  return null;
}

function describeResult(match, teamId) {
  const result = getResult(match, teamId);
  const opponent = getOpponentName(match, teamId);
  const homeScore = match?.score?.fullTime?.home;
  const awayScore = match?.score?.fullTime?.away;
  const scoreText =
    homeScore != null && awayScore != null
      ? ` (${homeScore}-${awayScore})`
      : "";

  if (result === "WIN") return `a win over ${opponent}${scoreText}`;
  if (result === "LOSS") return `a loss to ${opponent}${scoreText}`;
  return `a draw with ${opponent}${scoreText}`;
}

function getOpponentName(match, teamId) {
  if (match?.homeTeam?.id === teamId)
    return match?.awayTeam?.name || "its opponent";
  if (match?.awayTeam?.id === teamId)
    return match?.homeTeam?.name || "its opponent";
  return "its opponent";
}

function getKickoffContext(utcDate) {
  const diff = daysUntil(utcDate);

  if (diff <= 0) {
    return { badge: "Today", label: "today", isToday: true, isTomorrow: false };
  }

  if (diff === 1) {
    return {
      badge: "Tomorrow",
      label: "tomorrow",
      isToday: false,
      isTomorrow: true,
    };
  }

  if (diff <= 3) {
    return {
      badge: `In ${diff} days`,
      label: `in ${diff} days`,
      isToday: false,
      isTomorrow: false,
    };
  }

  return {
    badge: formatShortDate(utcDate),
    label: "soon",
    isToday: false,
    isTomorrow: false,
  };
}

function daysUntil(utcDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(utcDate);
  target.setHours(0, 0, 0, 0);

  return Math.round((target - today) / DAY_MS);
}

function formatShortDate(dateStr) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

function findStandingInfo(teamId, standingsTablesByLeague, leagueMetaByCode) {
  for (const [leagueCode, table] of standingsTablesByLeague.entries()) {
    const row = table.find((entry) => entry.team?.id === teamId);
    if (row) {
      return {
        leagueCode,
        leagueName: leagueMetaByCode[leagueCode]?.name || leagueCode,
        row,
        table,
      };
    }
  }

  return null;
}

function ordinal(num) {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
}

function limitPerTeam(items, maxPerTeam) {
  const counts = new Map();

  return items.filter((item) => {
    const current = counts.get(item.teamId) || 0;
    if (current >= maxPerTeam) return false;
    counts.set(item.teamId, current + 1);
    return true;
  });
}

function uniqueById(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
