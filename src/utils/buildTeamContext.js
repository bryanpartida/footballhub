function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function buildTeamContext({ team, scheduledMatches = [], finishedMatches = [], standings = [] }) {
    const nextMatch = [...scheduledMatches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0] || null;

    const recentMatches = [...finishedMatches]
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .slice(0, 5);

    const standingRow = standings.find((row) => row.team?.id === team?.id) || null;
    const leader = standings[0] || null;
    const second = standings[1] || null;
    const fourth = standings[3] || null;
    const relegationLine = standings[17] || null;

    const form = recentMatches.map((match) => getMatchResult(match, team?.id));
    const wins = form.filter((x) => x === "W").length;
    const draws = form.filter((x) => x === "D").length;
    const losses = form.filter((x) => x === "L").length;

    const nextOpponent = nextMatch ? getOpponent(nextMatch, team?.id) : null;
    const statusLabel = getStatusLabel(nextMatch?.utcDate);

    const cards = [
        {
            id: "next-match",
            title: nextMatch ? (statusLabel.isToday ? "Matchday" : "Next Match") : "No Match Scheduled",
            body: nextMatch
                ? `${team?.shortName || team?.name} ${isHome(nextMatch, team?.id) ? "hosts" : "travels to"} ${nextOpponent?.shortName || nextOpponent?.name} ${statusLabel.text}.`
                : `No upcoming fixture is available in the current response window.`,
            meta: nextMatch
                ? `${nextMatch.competition?.name || "Competition"} • ${formatKickoff(nextMatch.utcDate)}`
                : "Schedule unavailable",
        },
        {
            id: "form",
            title: "Recent Form",
            body: recentMatches.length
                ? `${team?.shortName || team?.name} has ${wins} win${wins === 1 ? "" : "s"}, ${draws} draw${draws === 1 ? "" : "s"}, and ${losses} loss${losses === 1 ? "" : "es"} in the last ${recentMatches.length} matches.`
                : "Recent results are not available yet.",
            meta: form.length ? form.join(" • ") : "No form sample",
        },
        {
            id: "league-context",
            title: "League Context",
            body: standingRow
                ? `${team?.shortName || team?.name} is ${ordinal(standingRow.position)} with ${standingRow.points} points.`
                : "League standing is not available yet.",
            meta: standingRow && leader ? `${leader.team?.shortName || leader.team?.name} leads the table` : "Standings unavailable",
        },
        {
            id: "why-it-matters",
            title: "Why It Matters",
            body: buildWhyItMatters({ team, nextMatch, nextOpponent, standingRow, leader, fourth, relegationLine, standings }),
            meta: nextOpponent?.name || "Context card",
        },
    ];

    return {
        nextMatch,
        nextOpponent,
        recentMatches,
        form,
        wins,
        draws,
        losses,
        standings,
        standingRow,
        leader,
        second,
        fourth,
        relegationLine,
        cards,
    };
}

function getMatchResult(match, teamId) {
    const winner = match?.score?.winner;
    if (!winner || !teamId) return "D";
    const isTeamHome = Number(match?.homeTeam?.id) === Number(teamId);
    if (winner === "DRAW") return "D";
    if (winner === "HOME_TEAM") return isTeamHome ? "W" : "L";
    if (winner === "AWAY_TEAM") return isTeamHome ? "L" : "W";
    return "D";
}

function getOpponent(match, teamId) {
    return Number(match?.homeTeam?.id) === Number(teamId) ? match?.awayTeam : match?.homeTeam;
}

function isHome(match, teamId) {
    return Number(match?.homeTeam?.id) === Number(teamId);
}

function formatKickoff(utcDate) {
    if (!utcDate) return "Kickoff TBD";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(utcDate));
}

function getStatusLabel(utcDate) {
    if (!utcDate) return { text: "soon", isToday: false };
    const now = new Date();
    const kick = new Date(utcDate);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfKick = new Date(kick.getFullYear(), kick.getMonth(), kick.getDate());
    const diffDays = Math.round((startOfKick - startOfToday) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { text: "today", isToday: true };
    if (diffDays === 1) return { text: "tomorrow", isToday: false };
    return { text: `on ${formatKickoff(utcDate)}`, isToday: false };
}

function buildWhyItMatters({ team, nextMatch, nextOpponent, standingRow, leader, fourth, relegationLine, standings }) {
    if (!standingRow) {
        return "This dashboard becomes stronger once standings data is available for the selected team.";
    }

    const name = team?.shortName || team?.name || "This team";

    if (standingRow.position === 1) {
        const lead = standings[1] ? standingRow.points - standings[1].points : null;
        return lead != null
            ? `${name} is leading the table, and this stretch is about protecting a ${lead}-point advantage.`
            : `${name} is leading the table, so every result matters in protecting control.`;
    }

    if (leader && leader.team?.id !== standingRow.team?.id) {
        const gapToTop = leader.points - standingRow.points;
        if (gapToTop > 0 && gapToTop <= 4) {
            return `${name} is still within ${gapToTop} point${gapToTop === 1 ? "" : "s"} of the top, so the title race is still in reach.`;
        }
    }

    if (standingRow.position <= 6 && fourth) {
        const gapToTopFour = fourth.points - standingRow.points;
        if (standingRow.position > 4 && gapToTopFour >= 0 && gapToTopFour <= 4) {
            return `${name} is close enough to the top four that a single result can change the European race.`;
        }
        if (standingRow.position <= 4) {
            const below = standings[standingRow.position];
            const cushion = below ? standingRow.points - below.points : null;
            return cushion != null
                ? `${name} is trying to protect a top-four place with only a ${cushion}-point margin over the team below.`
                : `${name} is trying to protect a top-four place.`;
        }
    }

    if (relegationLine) {
        const gapToDrop = standingRow.points - relegationLine.points;
        if (gapToDrop >= 0 && gapToDrop <= 4) {
            return `${name} is still close to the relegation line, so even short-term results carry real pressure.`;
        }
    }

    if (nextMatch && nextOpponent) {
        return `${name} is in a relatively stable part of the table, so the next match is more about momentum and keeping form than chasing a dramatic swing.`;
    }

    return `${name} is in the middle of the table, where consistent results are the key story right now.`;
}
