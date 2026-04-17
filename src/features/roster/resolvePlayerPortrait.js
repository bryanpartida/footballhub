const NON_NAME_TOKENS = new Set(["fc", "cf", "ac", "sc", "afc", "cfc", "club"]);

export function normalizeLookupText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/['’`.-]/g, " ")
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

export function formatPlayerNameForLookup(playerName) {
    return normalizeLookupText(playerName).replace(/\s+/g, "_");
}

export function resolveBestPlayerPortrait({ results = [], player, team }) {
    if (!Array.isArray(results) || !results.length || !player?.name) {
        return null;
    }

    const normalizedPlayerName = normalizeLookupText(player.name);
    const normalizedTeamName = normalizeTeamName(team?.name || team?.shortName || "");

    const ranked = results
        .map((candidate) => ({
            candidate,
            score: scoreCandidate(candidate, normalizedPlayerName, normalizedTeamName),
            image: getCandidatePortrait(candidate),
        }))
        .filter((entry) => entry.image && entry.score > 0)
        .sort((a, b) => b.score - a.score);

    return ranked[0]?.image || null;
}

function scoreCandidate(candidate, normalizedPlayerName, normalizedTeamName) {
    const candidateName = normalizeLookupText(candidate?.strPlayer || candidate?.strPlayerAlternate || "");
    if (!candidateName) return 0;

    let score = 0;

    if (candidateName === normalizedPlayerName) {
        score += 120;
    } else if (candidateName.includes(normalizedPlayerName) || normalizedPlayerName.includes(candidateName)) {
        score += 70;
    } else {
        const playerTokens = tokenSet(normalizedPlayerName);
        const candidateTokens = tokenSet(candidateName);
        const overlap = [...playerTokens].filter((token) => candidateTokens.has(token)).length;
        score += overlap * 18;
    }

    const candidateTeams = [
        candidate?.strTeam,
        candidate?.strTeam2,
        candidate?.strTeamNationality,
    ]
        .map((value) => normalizeTeamName(value))
        .filter(Boolean);

    if (normalizedTeamName && candidateTeams.some((candidateTeam) => candidateTeam === normalizedTeamName)) {
        score += 80;
    } else if (
        normalizedTeamName &&
        candidateTeams.some(
            (candidateTeam) =>
                candidateTeam.includes(normalizedTeamName) || normalizedTeamName.includes(candidateTeam),
        )
    ) {
        score += 45;
    }

    if (normalizeLookupText(candidate?.strSport) === "soccer") {
        score += 12;
    }

    if (candidate?.strThumb) score += 8;
    if (candidate?.strCutout) score += 4;
    if (candidate?.strRender) score += 2;

    return score;
}

function getCandidatePortrait(candidate) {
    return candidate?.strThumb || candidate?.strCutout || candidate?.strRender || null;
}

function normalizeTeamName(value) {
    const normalized = normalizeLookupText(value);
    if (!normalized) return "";

    const filtered = normalized
        .split(" ")
        .filter((token) => token && !NON_NAME_TOKENS.has(token))
        .join(" ");

    return filtered || normalized;
}

function tokenSet(value) {
    return new Set(normalizeLookupText(value).split(" ").filter(Boolean));
}
