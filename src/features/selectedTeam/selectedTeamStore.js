import { getSelectedTeam, saveSelectedTeam } from "./selectedTeamStorage";

let selectedTeam = normalizeTeam(getSelectedTeam());
const listeners = new Set();

function normalizeTeam(team) {
    if (!team || !team.id) return null;

    return {
        id: Number(team.id),
        name: team.name || "Unknown Team",
        shortName: team.shortName || team.name || "Team",
        crest: team.crest || team.crestUrl || null,
        leagueCode: team.leagueCode || null,
    };
}

function emit() {
    listeners.forEach((listener) => listener());
}

export function subscribeSelectedTeam(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getSelectedTeamSnapshot() {
    return selectedTeam;
}

export function setSelectedTeam(nextTeam) {
    selectedTeam = normalizeTeam(nextTeam);
    saveSelectedTeam(selectedTeam);
    emit();
}

export function clearSelectedTeam() {
    selectedTeam = null;
    saveSelectedTeam(null);
    emit();
}

if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
        if (event.key !== "footballhub:selected-team") return;
        selectedTeam = normalizeTeam(getSelectedTeam());
        emit();
    });
}
