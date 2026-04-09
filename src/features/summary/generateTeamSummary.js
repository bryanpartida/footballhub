export function generateTeamSummary({ team, context, leagueName }) {
    const name = team?.shortName || team?.name || "This team";
    const nextMatch = context?.nextMatch;
    const standingRow = context?.standingRow;

    if (!nextMatch && !standingRow) {
        return `${name} is loaded, but there is not enough current match and standings context yet to build a meaningful daily briefing.`;
    }

    const opener = nextMatch
        ? `${name} ${isHome(nextMatch, team?.id) ? "hosts" : "faces"} ${getOpponent(nextMatch, team?.id)?.shortName || getOpponent(nextMatch, team?.id)?.name || "its next opponent"} ${whenText(nextMatch.utcDate)}.`
        : `${name} does not have a visible upcoming fixture in the current schedule window.`;

    const closer = standingRow
        ? standingRow.position <= 4
            ? `They are ${ordinal(standingRow.position)} in ${leagueName || "the league"}, so the focus is on protecting their place near the top.`
            : `They are ${ordinal(standingRow.position)} in ${leagueName || "the league"}, making each result important for shaping the next phase of the season.`
        : `Standings context is still loading for a fuller daily picture.`;

    return `${opener} ${closer}`;
}

function getOpponent(match, teamId) {
    return Number(match?.homeTeam?.id) === Number(teamId) ? match?.awayTeam : match?.homeTeam;
}

function isHome(match, teamId) {
    return Number(match?.homeTeam?.id) === Number(teamId);
}

function whenText(utcDate) {
    if (!utcDate) return "soon";
    const now = new Date();
    const kick = new Date(utcDate);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfKick = new Date(kick.getFullYear(), kick.getMonth(), kick.getDate());
    const diffDays = Math.round((startOfKick - startOfToday) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "tomorrow";
    return `on ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(kick)}`;
}

function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
