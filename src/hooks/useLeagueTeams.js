import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { api, LEAGUES } from "../api/footballData";

function normalizeTeam(team, leagueCode) {
    return {
        id: Number(team.id),
        name: team.name,
        shortName: team.shortName || team.tla || team.name,
        crest: team.crest || team.crestUrl || null,
        leagueCode,
    };
}

export function useLeagueTeams() {
    const results = useQueries({
        queries: Object.keys(LEAGUES).map((code) => ({
            queryKey: ["teams", code],
            queryFn: () => api.teams(code),
            staleTime: 1000 * 60 * 30,
        })),
    });

    const isLoading = results.some((result) => result.isLoading);
    const isError = results.some((result) => result.isError);
    const error = results.find((result) => result.error)?.error || null;

    const teams = useMemo(() => {
        return results
            .flatMap((result, index) => {
                const leagueCode = Object.keys(LEAGUES)[index];
                return (result.data?.teams || []).map((team) => normalizeTeam(team, leagueCode));
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [results]);

    return { teams, isLoading, isError, error };
}
