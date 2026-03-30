export function generateMatchInsights({
  match,
  standingsTable = [],
  homeRecentMatches = [],
  awayRecentMatches = [],
}) {
  if (!match) return [];

  const insights = [];
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  if (!homeTeam || !awayTeam) return insights;

  const homeRow = standingsTable.find((row) => row.team?.id === homeTeam.id);
  const awayRow = standingsTable.find((row) => row.team?.id === awayTeam.id);

  if (homeRow) {
    if (homeRow.position <= 4) {
      insights.push(
        `${homeTeam.name} is currently in Champions League qualification places.`,
      );
    } else if (homeRow.position === 5 || homeRow.position === 6) {
      insights.push(
        `${homeTeam.name} is pushing for European qualification from ${ordinal(homeRow.position)} place.`,
      );
    }
  }

  if (awayRow) {
    if (awayRow.position <= 4) {
      insights.push(
        `${awayTeam.name} is currently in Champions League qualification places.`,
      );
    } else if (awayRow.position === 5 || awayRow.position === 6) {
      insights.push(
        `${awayTeam.name} is pushing for European qualification from ${ordinal(awayRow.position)} place.`,
      );
    }
  }

  const homeWins = countWins(homeRecentMatches, homeTeam.id);
  const awayWins = countWins(awayRecentMatches, awayTeam.id);

  if (homeRecentMatches.length >= 3 && homeWins >= 3) {
    insights.push(
      `${homeTeam.name} has won ${homeWins} of its last ${homeRecentMatches.length} matches.`,
    );
  }

  if (awayRecentMatches.length >= 3 && awayWins >= 3) {
    insights.push(
      `${awayTeam.name} has won ${awayWins} of its last ${awayRecentMatches.length} matches.`,
    );
  }

  const homeLosses = countLosses(homeRecentMatches, homeTeam.id);
  const awayLosses = countLosses(awayRecentMatches, awayTeam.id);

  if (homeRecentMatches.length >= 3 && homeLosses >= 3) {
    insights.push(
      `${homeTeam.name} has lost ${homeLosses} of its last ${homeRecentMatches.length} matches.`,
    );
  }

  if (awayRecentMatches.length >= 3 && awayLosses >= 3) {
    insights.push(
      `${awayTeam.name} has lost ${awayLosses} of its last ${awayRecentMatches.length} matches.`,
    );
  }

  if (homeRow && awayRow) {
    const gap = Math.abs(homeRow.points - awayRow.points);
    if (gap <= 3) {
      insights.push(
        `Only ${gap} point${gap === 1 ? "" : "s"} separate these teams in the table.`,
      );
    }
  }

  return uniqueInsights(insights).slice(0, 3);
}

function countWins(matches, teamId) {
  return matches.filter((m) => {
    const homeId = m.homeTeam?.id;
    const awayId = m.awayTeam?.id;
    const homeScore = m.score?.fullTime?.home;
    const awayScore = m.score?.fullTime?.away;

    if (homeScore == null || awayScore == null) return false;

    if (homeId === teamId) return homeScore > awayScore;
    if (awayId === teamId) return awayScore > homeScore;
    return false;
  }).length;
}

function countLosses(matches, teamId) {
  return matches.filter((m) => {
    const homeId = m.homeTeam?.id;
    const awayId = m.awayTeam?.id;
    const homeScore = m.score?.fullTime?.home;
    const awayScore = m.score?.fullTime?.away;

    if (homeScore == null || awayScore == null) return false;

    if (homeId === teamId) return homeScore < awayScore;
    if (awayId === teamId) return awayScore < homeScore;
    return false;
  }).length;
}

function ordinal(num) {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
}

function uniqueInsights(items) {
  return [...new Set(items)];
}
