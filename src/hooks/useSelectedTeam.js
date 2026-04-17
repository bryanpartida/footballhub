import { useSyncExternalStore } from "react";
import {
    subscribeSelectedTeam,
    getSelectedTeamSnapshot,
    setSelectedTeam,
    clearSelectedTeam,
} from "../features/selectedTeam/selectedTeamStore";

export function useSelectedTeam() {
    const selectedTeam = useSyncExternalStore(
        subscribeSelectedTeam,
        getSelectedTeamSnapshot,
        getSelectedTeamSnapshot,
    );

    return {
        selectedTeam,
        setSelectedTeam,
        clearSelectedTeam,
    };
}
