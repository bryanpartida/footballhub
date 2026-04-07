export function generateMatchInsights({
  match,
  standingsTable = [],
  homeRecentMatches = [],
  awayRecentMatches = [],
}) {
  if (!match) {
    return { companion: [], quickFacts: [] };
  }

  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  if (!homeTeam || !awayTeam) {
    return { companion: [], quickFacts: [] };
  }

  const competitionName = match.competition?.name || "this competition";
  const homeRow = standingsTable.find((row) => row.team?.id === homeTeam.id);
  const awayRow = standingsTable.find((row) => row.team?.id === awayTeam.id);
  const leagueLeader = standingsTable[0];
  const fourthPlace = standingsTable[3];

  const companionCandidates = [];
  const quickFactCandidates = [];

  const homeForm = summarizeForm(homeRecentMatches, homeTeam.id);
  const awayForm = summarizeForm(awayRecentMatches, awayTeam.id);

  // ---------------------------------
  // MATCHDAY COMPANION (editorial)
  // ---------------------------------

  // 1. European-night context
  if (isEuropeanCompetition(competitionName)) {
    companionCandidates.push({
      id: `europe-${match.id}`,
      priority: 100,
      title: `${competitionName} pressure`,
      body: `${homeTeam.name} and ${awayTeam.name} meet on a European night, where small moments can completely reshape the tie.`,
      tone: "amber",
    });
  }

  // 2. Direct-rival / swing match context
  if (homeRow && awayRow) {
    const pointsGap = Math.abs((homeRow.points ?? 0) - (awayRow.points ?? 0));
    const positionGap = Math.abs(
      (homeRow.position ?? 999) - (awayRow.position ?? 999),
    );

    if (pointsGap <= 3 && positionGap <= 3) {
      companionCandidates.push({
        id: `direct-rival-${match.id}`,
        priority: 98,
        title: `A direct table swing match`,
        body: `Only ${pointsGap} point${
          pointsGap === 1 ? "" : "s"
        } separate ${homeTeam.name} and ${awayTeam.name}, so this one can shift the race immediately.`,
        tone: "sky",
      });
    }
  }

  // 3. Title-race / pressure context
  if (homeRow && leagueLeader && homeRow.team?.id === homeTeam.id) {
    const gapToTop = Math.abs(
      (leagueLeader.points ?? 0) - (homeRow.points ?? 0),
    );

    if (homeRow.position === 1) {
      companionCandidates.push({
        id: `home-top-${match.id}`,
        priority: 94,
        title: `${homeTeam.name} is trying to protect control`,
        body: `${homeTeam.name} comes into this match leading the table, so any slip could quickly change the tone of the race.`,
        tone: "emerald",
      });
    } else if (gapToTop <= 3) {
      companionCandidates.push({
        id: `home-title-race-${match.id}`,
        priority: 92,
        title: `${homeTeam.name} is staying in the title race`,
        body: `${homeTeam.name} is close enough to the top that this match still carries real title-race pressure.`,
        tone: "emerald",
      });
    }
  }

  if (awayRow && leagueLeader && awayRow.team?.id === awayTeam.id) {
    const gapToTop = Math.abs(
      (leagueLeader.points ?? 0) - (awayRow.points ?? 0),
    );

    if (awayRow.position === 1) {
      companionCandidates.push({
        id: `away-top-${match.id}`,
        priority: 94,
        title: `${awayTeam.name} is trying to protect control`,
        body: `${awayTeam.name} comes into this match leading the table, so dropped points would immediately invite pressure.`,
        tone: "emerald",
      });
    } else if (gapToTop <= 3) {
      companionCandidates.push({
        id: `away-title-race-${match.id}`,
        priority: 92,
        title: `${awayTeam.name} is staying in the title race`,
        body: `${awayTeam.name} is still close enough to the top that every result matters.`,
        tone: "emerald",
      });
    }
  }

  // 4. Top-four pressure, but only when it is actually relevant
  if (homeRow && shouldMentionTopFourPressure(homeRow, standingsTable)) {
    companionCandidates.push({
      id: `home-top-four-${match.id}`,
      priority: 86,
      title: `${homeTeam.name} is under top-four pressure`,
      body: `${homeTeam.name} is in a part of the table where a single result can change the Champions League race.`,
      tone: "sky",
    });
  }

  if (awayRow && shouldMentionTopFourPressure(awayRow, standingsTable)) {
    companionCandidates.push({
      id: `away-top-four-${match.id}`,
      priority: 86,
      title: `${awayTeam.name} is under top-four pressure`,
      body: `${awayTeam.name} is in a part of the table where a single result can change the Champions League race.`,
      tone: "sky",
    });
  }

  // 5. Bounce-back narrative after a loss
  if (homeForm.lastResult === "LOSS") {
    companionCandidates.push({
      id: `home-bounce-${match.id}`,
      priority: 91,
      title: `${homeTeam.name} needs a response`,
      body: `${homeTeam.name} is coming off a defeat, which makes this a good test of its reaction and momentum.`,
      tone: "rose",
    });
  }

  if (awayForm.lastResult === "LOSS") {
    companionCandidates.push({
      id: `away-bounce-${match.id}`,
      priority: 91,
      title: `${awayTeam.name} needs a response`,
      body: `${awayTeam.name} is coming off a defeat, so this match matters as a bounce-back opportunity.`,
      tone: "rose",
    });
  }

  // 6. Momentum contrast
  if (homeForm.wins >= 4 && awayForm.losses >= 3) {
    companionCandidates.push({
      id: `momentum-home-${match.id}`,
      priority: 88,
      title: `${homeTeam.name} carries the stronger momentum`,
      body: `${homeTeam.name} arrives in form, while ${awayTeam.name} comes in under more pressure from recent results.`,
      tone: "emerald",
    });
  }

  if (awayForm.wins >= 4 && homeForm.losses >= 3) {
    companionCandidates.push({
      id: `momentum-away-${match.id}`,
      priority: 88,
      title: `${awayTeam.name} carries the stronger momentum`,
      body: `${awayTeam.name} arrives with better recent form, while ${homeTeam.name} is trying to steady itself.`,
      tone: "emerald",
    });
  }

  // ---------------------------------
  // THREE THINGS TO KNOW (quick facts)
  // ---------------------------------

  if (homeForm.sampleSize >= 3 && homeForm.wins >= 3) {
    quickFactCandidates.push({
      id: `home-form-win-${match.id}`,
      priority: 90,
      text: `${homeTeam.name} has won ${homeForm.wins} of its last ${homeForm.sampleSize} matches.`,
    });
  }

  if (awayForm.sampleSize >= 3 && awayForm.wins >= 3) {
    quickFactCandidates.push({
      id: `away-form-win-${match.id}`,
      priority: 90,
      text: `${awayTeam.name} has won ${awayForm.wins} of its last ${awayForm.sampleSize} matches.`,
    });
  }

  if (homeForm.sampleSize >= 3 && homeForm.losses >= 3) {
    quickFactCandidates.push({
      id: `home-form-loss-${match.id}`,
      priority: 84,
      text: `${homeTeam.name} has lost ${homeForm.losses} of its last ${homeForm.sampleSize} matches.`,
    });
  }

  if (awayForm.sampleSize >= 3 && awayForm.losses >= 3) {
    quickFactCandidates.push({
      id: `away-form-loss-${match.id}`,
      priority: 84,
      text: `${awayTeam.name} has lost ${awayForm.losses} of its last ${awayForm.sampleSize} matches.`,
    });
  }

  if (homeRow && awayRow) {
    const pointsGap = Math.abs((homeRow.points ?? 0) - (awayRow.points ?? 0));

    quickFactCandidates.push({
      id: `positions-${match.id}`,
      priority: 92,
      text: `${homeTeam.name} is ${ordinal(homeRow.position)} and ${awayTeam.name} is ${ordinal(awayRow.position)} in the table.`,
    });

    if (pointsGap <= 6) {
      quickFactCandidates.push({
        id: `gap-${match.id}`,
        priority: 91,
        text: `Only ${pointsGap} point${
          pointsGap === 1 ? "" : "s"
        } separate these teams in the standings.`,
      });
    }

    if (homeRow.position <= 6 && fourthPlace && homeRow.position > 4) {
      const gapToTopFour = (fourthPlace.points ?? 0) - (homeRow.points ?? 0);
      if (gapToTopFour >= 0 && gapToTopFour <= 4) {
        quickFactCandidates.push({
          id: `home-europe-chase-${match.id}`,
          priority: 88,
          text: `${homeTeam.name} is ${gapToTopFour} point${
            gapToTopFour === 1 ? "" : "s"
          } off the top four.`,
        });
      }
    }

    if (awayRow.position <= 6 && fourthPlace && awayRow.position > 4) {
      const gapToTopFour = (fourthPlace.points ?? 0) - (awayRow.points ?? 0);
      if (gapToTopFour >= 0 && gapToTopFour <= 4) {
        quickFactCandidates.push({
          id: `away-europe-chase-${match.id}`,
          priority: 88,
          text: `${awayTeam.name} is ${gapToTopFour} point${
            gapToTopFour === 1 ? "" : "s"
          } off the top four.`,
        });
      }
    }
  }

  if (match.status === "FINISHED") {
    quickFactCandidates.push({
      id: `result-status-${match.id}`,
      priority: 78,
      text: `This match has already been played, so the context now is about what the result changes next.`,
    });
  } else {
    quickFactCandidates.push({
      id: `pre-match-${match.id}`,
      priority: 78,
      text: `This match is still ahead, so the main questions are pressure, form, and what changes if one side takes the points.`,
    });
  }

  const companion = uniqueById(companionCandidates)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 2);

  const quickFacts = uniqueById(quickFactCandidates)
    .sort((a, b) => b.priority - a.priority)
    .map((item) => item.text)
    .slice(0, 3);

  return { companion, quickFacts };
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

  return {
    wins,
    losses,
    draws,
    sampleSize: recent.length,
    lastResult: recent.length ? getResult(recent[0], teamId) : null,
  };
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

function shouldMentionTopFourPressure(row, table) {
  if (!row || !table?.length) return false;

  const position = row.position ?? 999;

  // Suppress this for runaway/top-of-table teams where it sounds generic
  if (position <= 2) return false;

  // Most relevant around the actual top-four race area
  if (position < 3 || position > 6) return false;

  const below = table[position];
  const above = table[position - 2];

  const gapBelow =
    below && below.points != null
      ? Math.abs((row.points ?? 0) - below.points)
      : 99;

  const gapAbove =
    above && above.points != null
      ? Math.abs((row.points ?? 0) - above.points)
      : 99;

  return gapBelow <= 3 || gapAbove <= 3;
}

function ordinal(num) {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
}

function isEuropeanCompetition(name = "") {
  return /champions|europa|conference/i.test(name);
}

function uniqueById(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
