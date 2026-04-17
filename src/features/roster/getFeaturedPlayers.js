export function getFeaturedPlayers({ players = [], scorerSources = [], teamId }) {
    const playerMap = new Map(players.map((player) => [Number(player.id), player]));
    const totals = new Map();

    scorerSources.forEach((source) => {
        const competition = source?.competition;
        const scorers = source?.data?.scorers;

        if (!Array.isArray(scorers)) return;

        scorers.forEach((entry) => {
            if (Number(entry?.team?.id) !== Number(teamId)) return;

            const playerId = Number(entry?.player?.id);
            if (!playerId) return;

            const aggregate = totals.get(playerId) || {
                playerId,
                goals: 0,
                assists: 0,
                competitions: new Set(),
            };

            aggregate.goals += getSafeNumber(entry?.goals);
            aggregate.assists += getSafeNumber(entry?.assists);

            if (competition?.code) {
                aggregate.competitions.add(competition.code);
            }

            totals.set(playerId, aggregate);
        });
    });

    const ranked = [...totals.values()]
        .map((entry) => ({
            ...entry,
            competitions: [...entry.competitions],
            player: playerMap.get(entry.playerId) || null,
        }))
        .filter((entry) => entry.player);

    const topScorer = [...ranked]
        .filter((entry) => entry.goals > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.player.name.localeCompare(b.player.name))[0] || null;

    const topAssistProvider = [...ranked]
        .filter((entry) => entry.assists > 0)
        .sort((a, b) => b.assists - a.assists || b.goals - a.goals || a.player.name.localeCompare(b.player.name))[0] || null;

    const featuredById = new Map();

    if (topScorer) {
        featuredById.set(topScorer.playerId, {
            ...topScorer.player,
            goals: topScorer.goals,
            assists: topScorer.assists,
            competitionsTracked: topScorer.competitions.length,
            featureLabels: ["Top scorer"],
        });
    }

    if (topAssistProvider) {
        const existing = featuredById.get(topAssistProvider.playerId);

        if (existing) {
            featuredById.set(topAssistProvider.playerId, {
                ...existing,
                goals: Math.max(existing.goals, topAssistProvider.goals),
                assists: Math.max(existing.assists, topAssistProvider.assists),
                competitionsTracked: Math.max(existing.competitionsTracked, topAssistProvider.competitions.length),
                featureLabels: [...existing.featureLabels, "Top assist provider"],
            });
        } else {
            featuredById.set(topAssistProvider.playerId, {
                ...topAssistProvider.player,
                goals: topAssistProvider.goals,
                assists: topAssistProvider.assists,
                competitionsTracked: topAssistProvider.competitions.length,
                featureLabels: ["Top assist provider"],
            });
        }
    }

    return {
        featuredPlayers: [...featuredById.values()],
        hasFeaturedStats: Boolean(topScorer || topAssistProvider),
        hasScorerData: ranked.length > 0,
    };
}

function getSafeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
