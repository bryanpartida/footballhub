import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { theSportsDbApi } from "../../api/theSportsDb";
import { formatPlayerNameForLookup, resolveBestPlayerPortrait } from "./resolvePlayerPortrait";

export function useRosterPortraits({ players = [], team }) {
    const portraitQueries = useQueries({
        queries: players.map((player) => ({
            queryKey: ["sportsdb-player-portrait", team?.name || team?.shortName || "", player.name],
            queryFn: async () => {
                const lookup = formatPlayerNameForLookup(player.name);
                if (!lookup) return null;

                try {
                    const response = await theSportsDbApi.searchPlayers(lookup);
                    return resolveBestPlayerPortrait({
                        results: response?.player || [],
                        player,
                        team,
                    });
                } catch {
                    return null;
                }
            },
            enabled: Boolean(player?.name),
            staleTime: 1000 * 60 * 60 * 24,
            gcTime: 1000 * 60 * 60 * 24,
            retry: false,
            refetchOnWindowFocus: false,
        })),
    });

    return useMemo(() => {
        const portraitsById = new Map();

        players.forEach((player, index) => {
            const portrait = portraitQueries[index]?.data || null;
            if (portrait) {
                portraitsById.set(player.id, portrait);
            }
        });

        return portraitsById;
    }, [players, portraitQueries]);
}
